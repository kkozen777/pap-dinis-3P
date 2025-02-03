import axios from 'axios';

const API_BASE_URL = 'https://ca3e-2001-818-c5f6-ea00-d09d-62ca-e69e-c184.ngrok-free.app';  // Replace with your actual API URL

// Create an axios instance
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    },
  });

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

// Extrai um valor específico do payload do token
async function getTokenValue(key) {
  try {
    const token = localStorage.getItem('authToken');
    const response = await apiClient.get('/auth/getTokenValue', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: { key },
    });
    return response.data.value; // Retorna o valor específico do payload
  } catch (error) {
    console.error('Error extraicting value from token:', error);
    throw new Error('Failed from extraicting tokens value.');
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

    // Assume que o backend retorna `false` se o token estiver válido
    return response.data.expired;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      logout(); // Remove token inválido
      return true; // Token expirado ou inválido
    }
    throw new Error("Error verifying the token.");
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
    return response.data; // Retorna o payload decodificado
  } catch (error) {
    console.error('Error decodifing the token.:', error);
    throw new Error('Failed decodifing the token.');
  }
}

// Function to handle driver login
async function login(body) {
  try {
    const response = await apiClient.post('/auth/loginAdmin', body); // Make API call
    return response.data; // Return the response data
  } catch (err) {
    console.error("Login error:", err);
    // Check for specific error messages from the server
    throw new Error(err.response?.data?.message || "Login failed. Invalid credentials.");
  }
}
async function logout() {
  try {
    //fazer clear do cache
    localStorage.removeItem('authToken'); // Remove the token from localStorage
    return true;
    // Optionally, you can redirect to login page here if needed
  } catch (error) {
    console.error("Error during logout:", error);
    throw new Error("Failed to log out. Please try again later.");

  }
}
export default {
  login,
  logout,
  isAuthenticated,
  getTokenValue,
  isTokenExpired,
  decodeToken
};
