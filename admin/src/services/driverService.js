// src/services/apiService.js
import axios from 'axios';

const API_BASE_URL = 'https://ca3e-2001-818-c5f6-ea00-d09d-62ca-e69e-c184.ngrok-free.app';  // Replace with your actual API URL

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

function createDriver(driverData) { 
    return apiClient.post('/admin/createDriver', driverData);
}

function updateDriver(driverId, driverData) {
    return apiClient.patch(`/admin/updateDriver/${driverId}`, driverData)
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
