// src/services/apiService.js
import axios from 'axios';

const API_BASE_URL = 'https://ca3e-2001-818-c5f6-ea00-d09d-62ca-e69e-c184.ngrok-free.app';  // Replace with your actual API URL

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
