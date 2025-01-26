import axios from 'axios';

const API_BASE_URL = 'https://39b4-87-196-81-48.ngrok-free.app';  // Replace with your actual API URL
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
        const coordinates = response.data;
        console.log(coordinates)
        return response; // Assumindo que o servidor retorna { latitude, longitude }
    } catch (error) {
      console.error("Erro ao obter a última localização:", error);
      throw new Error(
        error.response?.data?.message ||
        "Não foi possível obter a localização. Verifique a conexão ou os parâmetros fornecidos."
      );
    }
  }
  
async function getRoutePath(routeId) {
    if (!routeId) {
      throw new Error("O Route ID é obrigatório para obter a localização.");
    }
  
    try {
        const response = await apiClient.get(`/routes/getRoutePath/${routeId}`);
        return response.data; // Assumindo que o servidor retorna { latitude, longitude }
    } catch (error) {
      console.error("Erro ao obter a última localização:", error);
      throw new Error(
        error.response?.data?.message ||
        "Não foi possível obter a localização. Verifique a conexão ou os parâmetros fornecidos."
      );
    }
  }

  async function getPathById(pathId) {
    if (!pathId) {
      throw new Error("O pathId ID é obrigatório para obter a localização.");
    }
  
    try {
        const response = await apiClient.get(`/paths/${pathId}`);
        return response.data; // Assumindo que o servidor retorna { latitude, longitude }
    } catch (error) {
      console.error("Erro ao obter a última localização:", error);
      throw new Error(
        error.response?.data?.message ||
        "Não foi possível obter a localização. Verifique a conexão ou os parâmetros fornecidos."
      );
    }
  }

function createPath(pathData) {
        return apiClient.post(`/admin/createPath`, pathData); // Usando POST para criar um novo motorista
    }

function updatePath(pathId, pathData) {
        return apiClient.patch(`/admin/updatePath/${pathId}`, pathData); // Enviar os dados do motorista
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