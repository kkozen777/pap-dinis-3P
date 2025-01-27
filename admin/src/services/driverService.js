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
function createDriver(driverData) {
    return apiClient.post('/admin/createDriver', driverData); // Usando POST para criar um novo motorista
}

function updateDriver(driverId, driverData) {
    return apiClient.patch(`/admin/updateDriver/${driverId}`, driverData); // Enviar os dados do motorista
}

function deleteDriver(driverId) {
    return apiClient.delete(`/admin/deleteDriver/${driverId}`);
}

function getDrivers() {
  return apiClient.get('/drivers/');
}

function getDriverById(driverId) {
  return apiClient.get(`/driver/'${driverId}`);
}

export default {
    getDrivers,
    getDriverById,
    createDriver,
    updateDriver,
    deleteDriver
};
