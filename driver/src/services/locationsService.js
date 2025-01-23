// locationService.js
import axios from 'axios';

const API_BASE_URL = 'https://24bd-87-196-81-5.ngrok-free.app';  // Replace with your actual API URL

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
