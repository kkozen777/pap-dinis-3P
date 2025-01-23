import axios from 'axios';

// const API_BASE_URL = 'https://38f7-2001-818-c5f6-ea00-d4f3-9c44-60f3-2527.ngrok-free.app'; // Replace with your API's base URL


const API_BASE_URL = 'https://24bd-87-196-81-5.ngrok-free.app';  // Replace with your actual API URL
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
