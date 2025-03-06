import axios from 'axios';

const API_BASE_URL = 'https://d9e4-2001-818-c5f6-ea00-5c53-30ad-4d08-ff8e.ngrok-free.app';  // Replace with your actual API URL
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