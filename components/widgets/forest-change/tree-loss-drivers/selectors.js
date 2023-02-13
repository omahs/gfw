import { createSelector, createStructuredSelector } from 'reselect';
import isEmpty from 'lodash/isEmpty';
import sum from 'lodash/sum';
import sumBy from 'lodash/sumBy';
import entries from 'lodash/entries';
import groupBy from 'lodash/groupBy';
import findIndex from 'lodash/findIndex';
import { format } from 'd3-format';
import sortBy from 'lodash/sortBy';
import { yearTicksFormatter } from 'components/widgets/utils/data';

import tscLossCategories from 'data/tsc-loss-categories.json';

// get list data
const getLoss = (state) => state.data && state.data.loss;
const getSettings = (state) => state.settings;
const getLocationName = (state) => state.locationLabel;
const getColors = (state) => state.colors;
const getSentences = (state) => state.sentences;
const getAlerts = (state) => state.alerts;
const getTitle = (state) => state.title;
const getAdm0 = (state) => state.adm0;

export const getPermCats = createSelector([], () =>
  tscLossCategories.filter((x) => x.permanent).map((el) => el.value.toString())
);

export const mergeDataWithCetagories = createSelector(
  [getLoss, getPermCats],
  (data, permCats) => {
    if (isEmpty(data)) return null;

    return data.map((d) => ({
      ...d,
      permanent: permCats.includes(d.bound1),
    }));
  }
);

export const getFilteredData = createSelector(
  [mergeDataWithCetagories, getSettings, getPermCats],
  (data, settings, permCats) => {
    if (isEmpty(data)) return null;
    const { startYear, endYear } = settings;
    const filteredByYear = data.filter(
      (d) => d.year >= startYear && d.year <= endYear
    );
    const permanentData = filteredByYear.filter((d) =>
      permCats.includes(d.bound1)
    );
    return settings.tscDriverGroup === 'permanent'
      ? permanentData
      : filteredByYear;
  }
);

export const getAllLoss = createSelector(
  [mergeDataWithCetagories, getSettings],
  (data, settings) => {
    if (isEmpty(data)) return null;
    const { startYear, endYear } = settings;
    return data.filter((d) => d.year >= startYear && d.year <= endYear);
  }
);

export const getDrivers = createSelector(
  [getFilteredData, getSettings, getPermCats],
  (data, settings, permCats) => {
    if (isEmpty(data)) return null;
    const groupedData = groupBy(sortBy(data, 'area').reverse(), 'bound1');
    const filteredData = Object.keys(groupedData)
      .filter((key) => permCats.includes(key))
      .reduce(
        (obj, key) => ({
          ...obj,
          [key]: groupedData[key],
        }),
        {}
      );

    const groupedLoss =
      settings.tscDriverGroup === 'permanent' ? filteredData : groupedData;
    const sortedLoss = !isEmpty(groupedLoss)
      ? sortBy(
          Object.keys(groupedLoss).map((k) => {
            const cat = tscLossCategories.find((c) => c.value.toString() === k);
            return {
              driver: k,
              position: cat && cat.position,
              area: sumBy(groupedLoss[k], 'area'),
              permanent: permCats.includes(k),
            };
          }),
          'area'
        )
      : permCats.map((x) => ({
          driver: x.toString(),
          area: 0.0,
        }));
    return sortedLoss;
  }
);

// get lists selected
export const parseData = createSelector([getFilteredData], (data) => {
  if (isEmpty(data)) return null;
  const groupedData = groupBy(data, 'year');
  const x = Object.keys(groupedData).map((y) => {
    const groupedByBound = groupBy(groupedData[y], 'bound1');
    const datakeys = entries(groupedByBound).reduce((acc, [key, value]) => {
      const areaSum = sumBy(value, 'area');
      return {
        ...acc,
        [`class_${key}`]: areaSum < 1000 ? Math.round(areaSum) : areaSum,
      };
    }, {});
    return {
      year: y,
      total: sum(Object.values(datakeys)),
      ...datakeys,
    };
  });
  return x;
});

export const parseConfig = createSelector(
  [getColors, getFilteredData, getDrivers, getSettings],
  (colors, data, drivers, settings) => {
    if (isEmpty(data)) return null;
    const { highlighted } = settings || {};
    const yKeys = {};
    const categoryColors = colors.lossDrivers;
    sortBy(drivers, 'position').forEach((k) => {
      yKeys[`class_${k.driver}`] = {
        fill: categoryColors[k.driver],
        stackId: 1,
        opacity: !highlighted || (highlighted && k.permanent) ? 1 : 0.3,
      };
    });
    let tooltip = [
      {
        key: 'year',
      },
      {
        key: 'total',
        label: 'Total',
        unit: 'ha',
        unitFormat: (value) =>
          value < 1000 ? Math.round(value) : format('.3s')(value),
      },
    ];
    tooltip = tooltip.concat(
      sortBy(drivers, 'position')
        .map((d) => {
          const tscCat = tscLossCategories.find((c) => c.value === d.driver);
          const label = tscCat && tscCat.label;
          return {
            key: `class_${d.driver}`,
            label,
            unit: 'ha',
            color: categoryColors[d.driver],
            unitFormat: (value) =>
              value < 1000 ? Math.round(value) : format('.3s')(value),
          };
        })
        .reverse()
    );
    const insertIndex = findIndex(tooltip, { key: 'class_Urbanization' });
    if (insertIndex > -1) {
      tooltip.splice(insertIndex, 0, {
        key: 'break',
        label: 'Drivers of permanent deforestation:',
      });
    }
    return {
      height: 250,
      xKey: 'year',
      yKeys: {
        bars: yKeys,
      },
      xAxis: {
        tickFormatter: yearTicksFormatter,
      },
      unit: 'ha',
      tooltip,
    };
  }
);

export const parseSentence = createSelector(
  [
    getFilteredData,
    getAllLoss,
    getSettings,
    getLocationName,
    getSentences,
    getPermCats,
  ],
  (data, allLoss, settings, locationName, sentences, permCats) => {
    if (isEmpty(data)) return null;
    const { initial, globalInitial, noLoss } = sentences;
    const { startYear, endYear } = settings;

    const filteredLoss =
      data && data.filter((x) => permCats.includes(x.bound1));

    const permLoss =
      (filteredLoss && filteredLoss.length && sumBy(filteredLoss, 'area')) || 0;
    const totalLoss =
      (allLoss && allLoss.length && sumBy(allLoss, 'area')) || 0;
    const permPercent = (permLoss && (permLoss / totalLoss) * 100) || 0;

    let sentence = locationName === 'global' ? globalInitial : initial;
    if (!permLoss) sentence = noLoss;

    const params = {
      location: locationName === 'global' ? 'Globally' : locationName,
      startYear,
      endYear,
      permPercent:
        permPercent && permPercent < 0.1
          ? '< 0.1%'
          : `${format('.2r')(permPercent)}%`,
      component: {
        key: 'deforestation',
        tooltip:
          'The drivers of permanent deforestation are mainly urbanization and commodity-driven deforestation. Shifting agriculture may or may not lead to deforestation, depending upon the impact and permanence of agricultural activities.',
      },
    };

    return {
      sentence,
      params,
    };
  }
);

export const parseTitle = createSelector(
  [getTitle, getLocationName],
  (title, name) => {
    let selectedTitle = title.initial;
    if (name === 'global') {
      selectedTitle = title.global;
    }
    return selectedTitle;
  }
);

export const parseAlerts = createSelector(
  [getAlerts, getAdm0],
  (alerts, adm0) => (adm0 === 'IDN' ? alerts.indonesia : alerts.default)
);

export default createStructuredSelector({
  data: parseData,
  config: parseConfig,
  sentence: parseSentence,
  title: parseTitle,
  alerts: parseAlerts,
});
