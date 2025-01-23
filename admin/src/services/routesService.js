// src/services/apiService.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000'; // Replace with your API's base URL

// Create an axios instance
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
// No seu service API
function createRoute(routeData) {
    return apiClient.post('/admin/createRoute', routeData); // Usando POST para criar um novo motorista
}

function updateRoute(routeId, routeData) {
    return apiClient.patch(`/admin/updateRoute/${routeId}`, routeData); // Enviar os dados do motorista
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
