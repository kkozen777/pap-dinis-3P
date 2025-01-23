import axios from 'axios';

// const API_BASE_URL = 'https://38f7-2001-818-c5f6-ea00-d4f3-9c44-60f3-2527.ngrok-free.app';  // Replace with your actual API URL
const API_BASE_URL = 'https://24bd-87-196-81-5.ngrok-free.app';  // Replace with your actual API URL

// Create an axios instance
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning':true
    },
  });
  
// Function to log the user out by removing the token
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
    console.error('Erro ao extrair valor do token:', error);
    throw new Error('Falha ao extrair valor do token.');
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
    throw new Error("Erro ao verificar expiração do token.");
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
    console.error('Erro ao decodificar o token:', error);
    throw new Error('Falha ao decodificar o token.');
  }
}

// Function to handle user signup
async function signup(body) {
  try {
    const response = await apiClient.post('/auth/signup', body); // Make API call
    return response.data; // Return the data from the response
  } catch (err) {
    console.error("Signup error:", err);
    // Check for specific error messages from the server
    throw new Error(err.response?.data?.message || "Signup failed. Please try again.");
  }
}

// Function to handle user login
async function login(body) {
  try {
    console.log(body)
    const response = await apiClient.post('/auth/loginUser', body); // Make API call
    return response.data; // Return the response data
  } catch (err) {
    console.error("Login error:", err);
    // Check for specific error messages from the server
    throw new Error(err.response?.data?.message || body.password + "Login #2 failed. Invalid credentials.");
  }
}

async function changePassword(currentPassword, newPassword) {
  try {
    const token = localStorage.getItem('authToken'); // Obtenha o token de autenticação
    const response = await apiClient.post(
      '/auth/change-password', // Endpoint da API
      { currentPassword, newPassword }, // Corpo da requisição no formato correto
      {
        headers: {
          Authorization: `Bearer ${token}`, // Adiciona o token no cabeçalho
        },
      }
    );
    return response; // Retorna a resposta da API (ex: mensagem de sucesso)
  } catch (error) {
    console.error("Error changing password:", error);
    throw new Error(error.response?.data?.message || "An error occurred");
  }
}

// Método para alterar o email
async function changeEmail(newEmail) {
  try {
    const token = localStorage.getItem('authToken');
    const response = await apiClient.post('/auth/change-email', newEmail,{
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data; // Retorna a resposta da API (ex: mensagem de sucesso)
  } catch (error) {
    console.error("Error changing email:", error);
    throw new Error(error.response?.data?.message || "An error occurred");
  }
}

// Método para excluir a conta
async function deleteAccount() {
  try {
    const token = localStorage.getItem('authToken');
    const response = await apiClient.delete('/auth/change-password',{
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting account:", error);
    throw new Error(error.response?.data?.message || "An error occurred");
  }
}

export default {
  login,
  signup,
  logout,
  isAuthenticated,
  getTokenValue,
  isTokenExpired,
  decodeToken,
  changePassword,
  changeEmail,
  deleteAccount
};
