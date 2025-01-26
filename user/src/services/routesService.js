import axios from 'axios';

const API_BASE_URL = 'https://39b4-87-196-81-48.ngrok-free.app';  // Replace with your actual API URL

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

function getRoutes() {
  return apiClient.get('/routes/');
}

function getRoutesByLineId(lineId) {
  console.log(lineId);
  if (!lineId) throw new Error('lineId is required');
  return apiClient.get(`/routes/getRoutesBylineId/${lineId}`);
}

export default {
  getRoutes,
  getRoutesByLineId,
  getRouteDetails
};
