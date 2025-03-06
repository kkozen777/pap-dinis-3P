import axios from 'axios';

const API_BASE_URL = 'https://d9e4-2001-818-c5f6-ea00-5c53-30ad-4d08-ff8e.ngrok-free.app';  // Replace with your actual API URL

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