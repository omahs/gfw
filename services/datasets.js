import { rwRequest, dataRequest } from 'utils/request';

const environmentString = () => {
  const env = process.env.NEXT_PUBLIC_FEATURE_ENV;
  let envString = 'production';
  if (env === 'preproduction') {
    envString += ',preproduction';
  }
  if (env === 'staging') {
    return 'staging';
  }
  return envString;
};

export const getDatasets = () =>
  rwRequest
    .get(
      `/dataset?application=gfw&includes=metadata,vocabulary,layer&published=true&page[size]=9999&env=${environmentString()}${
        environmentString() === 'staging'
          ? `&filterIncludesByEnv=true&refresh=${new Date()}`
          : ''
      }`
    )
    .then((res) => res?.data);

export const getDatasetMeta = () => {
  const metaData = {};

  fetch('https://api.resourcewatch.org/v1/glad-alerts/latest')
    .then((res) => res.json())
    .then((data) => {
      const latestDate = data?.data[0]?.attributes?.date;
      metaData['https://api.resourcewatch.org/glad-alerts/latest'] = latestDate;
    });

  return new Promise((resolve) => {
    return resolve(metaData);
  });
};

export const getDatasetQuery = ({ dataset, version = 'latest', sql, token }) =>
  dataRequest
    .get(`/dataset/${dataset}/${version}/query?sql=${sql}`, {
      cancelToken: token,
    })
    .then((res) => res?.data);

export const getDatasetGeostore = ({
  dataset,
  version = 'latest',
  geostoreId,
  token,
}) =>
  dataRequest
    .get(`/dataset/${dataset}/${version}/geostore/${geostoreId}`, {
      cancelToken: token,
    })
    .then((res) => res?.data);
