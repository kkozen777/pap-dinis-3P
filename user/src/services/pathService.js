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
  
  export default {
    getRoutePath,
  };