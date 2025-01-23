// driverService.js
import axios from 'axios';

const API_BASE_URL = 'https://24bd-87-196-81-5.ngrok-free.app';  // Replace with your actual API URL

// create an axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning':true

  },
});

/**
 * binds a driver to a specific route
 * @param {string} routeId - the ID of the route
 * @returns {Object} - the response data from the API
 * @throws {Error} - throws an error if binding fails
 */
async function bindDriverToRoute(routeId) {
  const token = localStorage.getItem('authToken');

  if (!token) {
    throw new Error('Token not found!');
  }

  try {
    // Verifica se o motorista já está associado a uma rota ativa
    const response = await getDriverStatus(); // Aguardar a resposta do status do motorista
    const driverStatus = response.data;
    console.log(driverStatus);
    // Se o motorista não tiver uma rota ativa, então associa a nova rota
    if (!driverStatus) {
      const body = {
        routeId,
        status: 1, // status pode ser dinâmico, conforme sua necessidade
      };

      const bindResponse = await apiClient.post('/driverRoute/assign-route', body, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return bindResponse.data; // Retorna o resultado
    } else {
      throw new Error('The driver is already associated with an active route.');
    }
  } catch (err) {
    console.error('Error associating driver to route:', err);
    throw new Error('Error associating driver to route. Check your connection and try again.');
  }
}

/**
 * ends the driver’s current route
 * @returns {Object} - the response data from the API
 * @throws {Error} - throws an error if ending the route fails
 */
async function endRoute() {
  const token = localStorage.getItem('authToken');

  if (!token) {
    throw new Error('Token not found!');
  }

  try {
    const response = await apiClient.post('/driverRoute/unssign-route', {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data; // return the response data if necessary
  } catch (err) {
    console.error('Error ending route:', err);
    throw new Error('Error ending the route. Please try again.');
  }
}

/**
 * retrieves the driver’s current status
 * @param {string} token - the driver’s authentication token
 * @returns {Object | false} - the driver status or false if not found
 * @throws {Error} - throws an error if fetching status fails
 */
async function getDriverStatus() {
  try {
    const token = localStorage.getItem('authToken');
    const response = await apiClient.get('/driverRoute/driver/status', {
      headers: {
        Authorization: `Bearer ${token}`, // sends the token in the header
      },
    });

    if (response == null) {
      return false;
    }

    return response; // return the data with associations
  } catch (err) {
    throw new Error('Error fetching associations');
  }
}

async function getDriverName() {
  try {
    const token = localStorage.getItem('authToken');
    const response = await apiClient.get('/drivers/getDriverName', {
      headers: {
        Authorization: `Bearer ${token}`, // sends the token in the header
      },
    });
    console.log("nome do driver", response)
    if (response == null) {
      return false;
    }

    return response.data; // Retorna apenas o nome do motorista
  } catch (err) {
    throw new Error('Error fetching associations');
  }
}

export default {
  bindDriverToRoute,
  endRoute,
  getDriverStatus,
  getDriverName
};
