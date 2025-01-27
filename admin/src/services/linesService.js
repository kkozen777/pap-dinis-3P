// src/services/apiService.js
import axios from 'axios';

const API_BASE_URL = 'https://d88c-87-196-81-40.ngrok-free.app';  // Replace with your actual API URL

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
// No seu service API
function createLine(lineData) {
    return apiClient.post('/admin/createLine', lineData); // Usando POST para criar um novo motorista
}

function updateLine(lineId, lineData) {
    return apiClient.patch(`/admin/updateLine/${lineId}`, lineData); // Enviar os dados do motorista
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
