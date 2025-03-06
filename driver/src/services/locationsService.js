// locationService.js
import axios from 'axios';

const API_BASE_URL = 'https://d9e4-2001-818-c5f6-ea00-5c53-30ad-4d08-ff8e.ngrok-free.app';  // Replace with your actual API URL

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning':true

  },
});

// sends the location to the backend
async function sendLocation(latitude, longitude) {
  const token = localStorage.getItem('authToken');

  if (!token) {
    throw new Error('Token not found!');
  }

  try {
    await apiClient.post('/driversLocations', { latitude, longitude }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    throw new Error('Falha ao verificar expiração do token.');
  }
}

export default {
  sendLocation,
};
