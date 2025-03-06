import axios from 'axios';

const API_BASE_URL = 'https://d9e4-2001-818-c5f6-ea00-5c53-30ad-4d08-ff8e.ngrok-free.app';  // Replace with your actual API URL

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
