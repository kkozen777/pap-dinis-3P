import axios from 'axios';

const API_BASE_URL = 'https://d88c-87-196-81-40.ngrok-free.app';  // Replace with your actual API URL

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',

  },
});

async function getUserName() {
    try {
      const token = localStorage.getItem('authToken');
      const response = await apiClient.get('/users/getUserName', {
        headers: {
          Authorization: `Bearer ${token}`, // sends the token in the header
        },
      });
      if (response == null) {
        return false;
      }
  
      return response.data; // Retorna apenas o nome do motorista
    } catch (err) {
      throw new Error('Error fetching associations');
    }
  }

export default {
    getUserName
};