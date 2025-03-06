import axios from 'axios';

const API_BASE_URL = 'https://backend.mybus.pt';  // Url da api

// cria a variavel que vai comunicar com as rotas
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      // 'ngrok-skip-browser-warning':true, utilizado quando usava o ngrok para testes https
    },
  });
  
// Faz um logout do user, ao eliminar o token do mesmo do localstorage do navegador
async function logout() {
  try {
    localStorage.removeItem('authToken'); // Remove do localStorage
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
    return response.status; // retrurn da variavel status dentro do Response
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

// Function to handle user signup
async function signup(body) {
  try {
    const response = await apiClient.post('/auth/signup', body); // Make API call
    return response.data; // Return the data from the response
  } catch (err) {
    // console.error("Signup error:", err);
    // Check for specific error messages from the server
    throw new Error(err.response?.data?.error || "Signup failed. Please try again.");
  }
}

// Função para fazer login do user
async function login(body) {
  try {
    const response = await apiClient.post('/auth/loginUser', body); // Envia os dados para a route da api
    return response.data; // faz um retorno do valor data dentro da resposta da api
  } catch (err) {
    console.error("Login error:", err);
    // procura a mensagem de erro, se ela existir retorna-a, caso não exista envia o outro erro
    throw new Error(err.response?.data?.message || "Login failed. Invalid credentials.");
  }
}

async function changePassword(currentPassword, newPassword) {
  try {
    const token = localStorage.getItem('authToken');
    const response = await apiClient.post(
      '/auth/changeUserPassword',
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

// Método para alterar o email
async function changeEmail(newEmail) {
  try {
    const token = localStorage.getItem('authToken');
    const response = await apiClient.post('/auth/changeEmail', 
      { email: newEmail },  // garantir que o corpo é um JSON
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json" 
        }
      }
    );
    
    return response.data; 
  } catch (error) {
    console.error("Error changing email:", error);
    throw new Error(error.response?.data?.message || "An error occurred");
  }
}

// para apagar a conta
async function deleteAccount() {
  try {
    const token = localStorage.getItem('authToken');
    const response = await apiClient.delete('/auth/deleteAccount',{
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
