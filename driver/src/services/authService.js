import axios from 'axios';

const API_BASE_URL = 'https://backend.mybus.pt';  // Replace with your actual API URL

// Create an axios instance
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning':true

    },
  });
  
// Function to log the driver out by removing the token
async function logout() {
  try {
    //fazer clear do cache
    localStorage.removeItem('authToken'); // Remove the token from localStorage
    return true;

  } catch (error) {
    console.error("Error during logout:", error);
    throw new Error("Failed to log out. Please try again later.");

  }
}

async function isAuthenticated() {
  try {
    const token = localStorage.getItem('authToken');
    const response = await apiClient.get('/auth/isAuthenticated',{
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.status; // Return the data from the response
  }catch (error) {
    console.error("Error:", error);
    throw new Error("Failed. Please try again later.");

  }
}

// Extrai um valor específico do token
async function getTokenValue(key) {
  try {
    const token = localStorage.getItem('authToken');
    const response = await apiClient.get('/auth/getTokenValue', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: { key },
    });
    return response.data.value;
  } catch (error) {
    console.error(' Error extracting tokens value', error);
    throw new Error('failed extracting tokens value.');
  }
}

// Verifica se o token está expirado
async function isTokenExpired(token) {
  try {
    const response = await apiClient.get("/auth/isTokenExpired", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.expired;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      logout(); 
      return true;
    }
    throw new Error("Error verifying tokens expiration.");
  }
}


async function decodeToken() {
  try {
    const token = localStorage.getItem('authToken');
    const response = await apiClient.get('/auth/decodeToken', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error decodifying token:', error);
    throw new Error('Falied to decodify the token.');
  }
}

// Function to handle driver login
async function login(body) {
  try {
    const response = await apiClient.post('/auth/loginDriver', body);
    return response.data; // Return the response data
  } catch (err) {
    console.error("Login error:", err);
    throw new Error(err.response?.data?.message || "Login failed. Invalid credentials.");
  }
}

async function changePassword(currentPassword, newPassword) {
  try {
    const token = localStorage.getItem('authToken');
    const response = await apiClient.post(
      '/auth/changeDriverPassword',
      { currentPassword, newPassword },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error changing password:", error);
    throw new Error(error.response?.data?.message || "An error occurred");
  }
}

export default {
  login,
  logout,
  isAuthenticated,
  getTokenValue,
  isTokenExpired,
  decodeToken,
  changePassword,
};
