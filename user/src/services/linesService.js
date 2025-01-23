// src/services/apiService.js
import axios from 'axios';

// const API_BASE_URL = 'https://38f7-2001-818-c5f6-ea00-d4f3-9c44-60f3-2527.ngrok-free.app';


const API_BASE_URL = 'https://24bd-87-196-81-5.ngrok-free.app';  // Replace with your actual API URL

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
  console.log("Fetching lines...");
  return apiClient.get('/lines/')
    .then(response => {
      console.log("API response:", response); // Log para verificar os dados retornados
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
