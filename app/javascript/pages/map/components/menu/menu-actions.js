import { createAction, createThunkAction } from 'redux-tools';
import { setComponentStateToUrl } from 'utils/stateToUrl';
import axios from 'axios';
import compact from 'lodash/compact';
import { parseGadm36Id } from 'utils/format';
import { MAP } from 'router';

export const setLocationsData = createAction('setLocationsData');
export const setMenuLoading = createAction('setMenuLoading');

export const setMenuSettings = createThunkAction(
  'setMenuSettings',
  change => (dispatch, state) => {
    dispatch(
      setComponentStateToUrl({
        key: 'menu',
        change,
        state
      })
    );
  }
);

const getSearchSQL = string => {
  const words = string.split(/,| |, /);
  const mappedWords = compact(words.map(w => (w ? `%25${w}%25` : '')));
  const whereQueries = mappedWords.map(
    w =>
      `LOWER(name_0) LIKE '${w}' OR LOWER(name_1) LIKE '${
        w
      }' OR LOWER(name_2) LIKE '${w}'`
  );

  return whereQueries.join(' OR ');
};

export const getLocationFromSearch = createThunkAction(
  'getLocationFromSearch',
  ({ search, token }) => dispatch => {
    dispatch(setMenuLoading(true));
    if (search) {
      axios
        .get(
          `${
            process.env.CARTO_API
          }/sql?q=SELECT gid_0, gid_1, gid_2, CASE WHEN gid_2 is not null THEN CONCAT(name_2, ', ', name_1, ', ', name_0) WHEN gid_1 is not null THEN CONCAT(name_1, ', ', name_0) WHEN gid_0 is not null THEN name_0 END AS label FROM gadm36_political_boundaries WHERE ${getSearchSQL(
            search
          )} AND gid_0 != 'TWN' AND gid_0 != 'XCA' ORDER BY level, label`,
          {
            cancelToken: token
          }
        )
        .then(response => {
          if (response.data.rows && response.data.rows.length) {
            dispatch(setLocationsData(response.data.rows));
          } else {
            dispatch(setLocationsData([]));
          }
          dispatch(setMenuLoading(false));
        })
        .catch(error => {
          console.info(error);
          dispatch(setMenuLoading(false));
        });
    }
  }
);

export const handleClickLocation = createThunkAction(
  'handleClickLocation',
  ({ iso, gid_1, gid_2 }) => (dispatch, getState) => {
    const query = getState().location.query || {};
    const location = parseGadm36Id(gid_2 || gid_1 || iso);
    dispatch({
      type: MAP,
      payload: {
        type: 'country',
        ...location
      },
      query: {
        ...query,
        map: {
          ...(query && query.map && query.map),
          canBound: true
        },
        analysis: {
          ...(query && query.analysis && query.analysis),
          showAnalysis: true
        }
      }
    });
  }
);
