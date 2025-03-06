// src/services/apiService.js
import axios from 'axios';

const API_BASE_URL = 'https://backend.mybus.pt';  // Replace with your actual API URL

// create an axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning':true

  },
});

/**
 * Fetch all routes from the /routes/ endpoint.
 * @returns {Promise} - Promise with the response data (list of routes)
 */
function getRoutes() {
  return apiClient.get('/routes/');
}
function getRoutesByLineId(lineId) {
  if (!lineId) throw new Error('lineId is required'); 
  return apiClient.get(`/routes/availableRoutes/${lineId}`);
}

export default {
  getRoutes,
  getRoutesByLineId
};
