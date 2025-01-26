// src/services/apiService.js
import axios from 'axios';

const API_BASE_URL = 'https://39b4-87-196-81-48.ngrok-free.app';  // Replace with your actual API URL

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
function getLines() {
  return apiClient.get('/lines/');
}
function getLineById(lineId) {
  return apiClient.get(`/lines/'${lineId}`);
}
export default {
  getLines,
  getLineById
};
