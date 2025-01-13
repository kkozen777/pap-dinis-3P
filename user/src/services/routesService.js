import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000'; // Replace with your API's base URL

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },

});
function getRouteDetails(routeId) {
  return apiClient.get(`/routes/getRoute/${routeId}`);
}

function getRoutes() {
  return apiClient.get('/routes/');
}

function getRoutesByLineId(lineId) {
  console.log(lineId)
  if (!lineId) throw new Error('lineId is required');
  return apiClient.get(`/routes/getRouterPerline/${lineId}`);
}

export default {
  getRoutes,
  getRoutesByLineId,
  getRouteDetails
};
