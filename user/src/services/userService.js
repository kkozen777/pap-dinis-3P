import axios from 'axios';

const API_BASE_URL = 'https://ca3e-2001-818-c5f6-ea00-d09d-62ca-e69e-c184.ngrok-free.app';  // Replace with your actual API URL

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