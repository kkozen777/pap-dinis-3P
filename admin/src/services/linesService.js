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

function createLine(lineData) {
    return apiClient.post('/admin/createLine', lineData)
}

function updateLine(lineId, lineData) {
    return apiClient.patch(`/admin/updateLine/${lineId}`, lineData);
}

function deleteLine(lineId) {
    return apiClient.delete(`/admin/deleteLine/${lineId}`);
}

function getLines() {
    return apiClient.get('/lines/');
}

function getLineById(lineId) {
  return apiClient.get(`/lines/'${lineId}`);
}

export default {
    createLine,
    updateLine,
    deleteLine,
    getLines,
    getLineById
};
