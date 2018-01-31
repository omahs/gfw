import axios from 'axios';

const REQUEST_URL = `${process.env.GFW_API_HOST_PROD}`;

const QUERIES = {
  gladAlerts: '{location}?aggregate_values=true&aggregate_by={period}'
};

const getLocationQuery = (country, region, subRegion) =>
  `${country}${region ? `/${region}` : ''}${subRegion ? `/${subRegion}` : ''}`;

export const fetchGladAlerts = ({ country, region, subRegion, period }) => {
  const url = `${REQUEST_URL}/glad-alerts/admin/${QUERIES.gladAlerts}`
    .replace('{location}', getLocationQuery(country, region, subRegion))
    .replace('{period}', period || 'week');
  return axios.get(url);
};
