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


  async function getRoutePath(routeId) {
    // Check if the routeId is provided
    if (!routeId) {
        throw new Error("Route ID is required to fetch the path.");
    }

    try {
        // Make an API request to get the route path
        const response = await apiClient.get(`/routes/getRoutePath/${routeId}`);
        return response.data;
    } catch (error) {
        // Log the error if the request fails
        console.error("Error fetching the route path:", error);

        throw new Error(
            error.response?.data?.message ||
            "Unable to fetch the path. Please check your connection or the provided parameters."
        );
    }
}

  
  export default {
    getRoutePath,
  };