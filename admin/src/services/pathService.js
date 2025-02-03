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


  async function getPaths() {
    try {
        const response = await apiClient.get(`/paths`);
        return response;
    } catch (error) {
        console.error("Error fetching paths:", error);
        throw new Error(
            error.response?.data?.message ||
            "Could not get paths. Check the connection or provided parameters."
        );
    }
}

async function getRoutePath(routeId) {
    if (!routeId) {
        throw new Error("Route ID is required to fetch the route path.");
    }

    try {
        const response = await apiClient.get(`/routes/getRoutePath/${routeId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching route path:", error);
        throw new Error(
            error.response?.data?.message ||
            "Could not get the route path. Check the connection or provided parameters."
        );
    }
}

async function getPathById(pathId) {
    if (!pathId) {
        throw new Error("Path ID is required to fetch the location.");
    }

    try {
        const response = await apiClient.get(`/paths/${pathId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching path by ID:", error);
        throw new Error(
            error.response?.data?.message ||
            "Could not retrieve the path. Check the connection or provided parameters."
        );
    }
}

function createPath(pathData) {
        return apiClient.post(`/admin/createPath`, pathData); 
    }

function updatePath(pathId, pathData) {
        return apiClient.patch(`/admin/updatePath/${pathId}`, pathData); 
    }

function deletePath(pathId) {
        return apiClient.delete(`/admin/deletePath/${pathId}`);
    }
  export default {
    getPaths,
    getRoutePath,
    getPathById,
    createPath,
    updatePath,
    deletePath
  };