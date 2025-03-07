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


async function getLatestLocation(routeId) {
    if (!routeId) {
      throw new Error("Route ID is required to fetch the location.");
    }
  
    try {
        const response = await apiClient.get(`/driversLocations/${routeId}/locations/latest`);
        return response.data;
    } catch (error) {
      console.error("Error fetching the last location:", error);
      throw new Error(
        error.response?.data?.message ||
        "Unable to fetch the location. Please check your connection."
      );
    }
  }
  
  export default {
    getLatestLocation,
  };