// src/services/apiService.js
import axios from 'axios';

const API_BASE_URL = 'https://backend.mybus.pt';  // Replace with your actual API URL

// Create an axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',

  },
});

/**
 * Fetch all routes from the /routes/ endpoint.
 * @returns {Promise} - Promise with the response data (list of routes)
 */
async function getLines() {
  return apiClient.get('/lines/')
    .then(response => {
      return response;
    })
    .catch(error => {
      console.error("Error fetching lines:", error);
      throw error;
    });
}
function getLineById(lineId) {
  return apiClient.get(`/lines/'${lineId}`);
}
export default {
  getLines,
  getLineById
};
