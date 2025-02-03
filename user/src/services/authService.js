import axios from 'axios';

const API_BASE_URL = 'https://ca3e-2001-818-c5f6-ea00-d09d-62ca-e69e-c184.ngrok-free.app';  // Replace with your actual API URL

// Create an axios instance
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning':true,
    },
  });
  
// Function to log the user out by removing the token
async function logout() {
  try {
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

// Function to handle user login
async function login(body) {
  try {
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
