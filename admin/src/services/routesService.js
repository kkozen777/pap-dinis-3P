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

function createRoute(routeData) {
    return apiClient.post('/admin/createRoute', routeData);
}

function updateRoute(routeId, routeData) {
    return apiClient.patch(`/admin/updateRoute/${routeId}`, routeData);
}

function deleteRoute(routeId) {
    return apiClient.delete(`/admin/deleteRoute/${routeId}`);
}

function getRoutes() {
    return apiClient.get('/routes/');
}

function getRouteById(routeId) {
  return apiClient.get(`/routes/'${routeId}`);
}

function getRoutesByLineId(lineId) {
    return apiClient.get(`/routes/getRoutesBylineId/${lineId}`);
}

export default {
    createRoute,
    updateRoute,
    deleteRoute,
    getRoutes,
    getRouteById,
    getRoutesByLineId
};
