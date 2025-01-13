// src/services/apiService.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000'; // Replace with your API's base URL

// create an axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
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
  console.log(lineId)
  if (!lineId) throw new Error('lineId is required'); 
  return apiClient.get(`/routes/availableRoutes/${lineId}`);
}

export default {
  getRoutes,
  getRoutesByLineId
};
