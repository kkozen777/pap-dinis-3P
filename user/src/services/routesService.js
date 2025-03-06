import axios from 'axios';

const API_BASE_URL = 'https://backend.mybus.pt';  // Replace with your actual API URL

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',

  },

});
function getRouteDetails(routeId) {
  return apiClient.get(`/routes/getRoute/${routeId}`);
}

function getRouteStarted_At(routeId) {
  return apiClient.get(`/driverRoute/route/getBindedRouteStarted_at/${routeId}`);
}

function getRoutes() {
  return apiClient.get('/routes/');
}

function getRoutesByLineId(lineId) {
  if (!lineId) throw new Error('lineId is required');
  return apiClient.get(`/routes/getRoutesBylineId/${lineId}`);
}

export default {
  getRoutes,
  getRoutesByLineId,
  getRouteDetails,
  getRouteStarted_At
};
