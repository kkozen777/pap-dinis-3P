import axios from 'axios';

const API_BASE_URL = 'https://39b4-87-196-81-48.ngrok-free.app';  // Replace with your actual API URL

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
      console.log("nome do user", response)
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