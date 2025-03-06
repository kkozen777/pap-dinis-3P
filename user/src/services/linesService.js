// src/services/apiService.js
import axios from 'axios';

const API_BASE_URL = 'https://d9e4-2001-818-c5f6-ea00-5c53-30ad-4d08-ff8e.ngrok-free.app';  // Replace with your actual API URL

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
