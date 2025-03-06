import axios from 'axios';

const API_BASE_URL = 'https://backend.mybus.pt';  // Replace with your actual API URL

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
          Authorization: `Bearer ${token}`,
        },
      });
      if (response == null) {
        return false;
      }
  
      return response.data;
    } catch (err) {
      throw new Error('Error fetching associations');
    }
  }

export default {
    getUserName
};