<template>
<div>
    <div>
      <h1>Welcome {{ name }}</h1>
      <!-- Logout button -->
      <button @click="logout">Logout</button>
    </div>

    <div v-if="loadingLines">Loading lines...</div>
    <div v-if="loadingRoutes">Loading routes...</div>

    <div v-if="!loadingRoutes && error" class="error">
      {{ error }}
    </div>

    <div v-if="!loadingRoutes && noRoutesMessage" class="info">
      {{ noRoutesMessage }}
    </div>

    <!-- Combo box to select line -->
    <select v-if="!loadingLines" v-model="selectedLine" @change="onLineChange">
      <option value="" disabled>Select a line</option>
      <option v-for="line in lines" :key="line.id" :value="line.id">
        {{ line.name }}
      </option>
    </select>

    <!-- Combo box to select route -->
    <select
      v-if="!loadingRoutes && routes.length > 0"
      v-model="selectedRoute"
    >
      <option value="" disabled>Select a route</option>
      <option v-for="route in routes" :key="route.id" :value="route.id">
        {{ route.start_time }}
      </option>
    </select>


    <!-- button to bind a driver to a route -->
    <div v-if="selectedRoute">
      <button @click="bindDriverToRoute" :disabled="loading">Bind to driver</button>
    </div>
  </div>
</template>

<script>
import authService from '@/services/authService';
import linesService from '@/services/linesService';
import routesService from '@/services/routesService';
import driverService from '@/services/driverService';

export default {
  data() {
    return {
      name: null, // name of the authenticated user
      lines: [], // list of available lines
      routes: [], // list of routes for the selected line
      selectedLine: "", // id of the selected line
      selectedRoute: "", // id of the selected route
      selectedRouteDetails: {}, // details of the selected route (if needed)
      loadingLines: false, // loading state for lines
      loadingRoutes: false, // loading state for routes
      error: null, // general error message
      noRoutesMessage: null, // specific message for "no routes available"
    };
  },

  methods: {
    logout() {
      // log out the user and redirect to the login page
      try {
        authService.logout();
        this.$router.push('/');
      } catch (error) {
        this.error = "Error during logout. Please try again.";
      }
    },

    // fetch the list of lines from the API
    async fetchLines() {
      this.loading = true;
      this.error = null;
      try {
        const response = await linesService.getLines();
        this.lines = response.data; // populate the lines array
      } catch (err) {
        this.error = 'Failed to load lines. Please try again later.';
        console.error(err);
      } finally {
        this.loading = false;
      }
    },

    // fetch the routes for the selected line
    async fetchRoutesForLine() {
      if (!this.selectedLine) {
        // clear routes if no line is selected
        this.routes = [];
        this.error = null;
        return;
      }

      this.loadingRoutes = true; // start loading routes
      this.error = null;
      this.routes = [];
      this.noRoutesMessage = null; // reset the no routes message

      try {
        const response = await routesService.getRoutesByLineId(this.selectedLine);
        this.routes = response.data.data; // populate the routes array
      } catch (err) {
        if (err.response && err.response.status === 404) {
          // handle "no routes available" scenario
          this.error = null;
          this.noRoutesMessage = `No routes available for the selected line.`;
        } else {
          // handle other errors
          this.error = "Failed to load routes. Please try again later.";
          this.noRoutesMessage = null;
        }
      } finally {
        this.loadingRoutes = false; // stop loading routes
      }
    },

    // bind a driver to the selected route
    async bindDriverToRoute() {
      if (!this.selectedRoute) return; // do nothing if no route is selected

      this.loading = true;
      this.error = null;

      try {
        console.log('Binding driver to route:', this.selectedRoute);

        // call the service to bind the driver to the route
        await driverService.bindDriverToRoute(this.selectedRoute);

        alert('Driver successfully bound to the route!');
        this.$router.push('/tracking'); // redirect to the tracking page
      } catch (err) {
        this.error = err.message || 'Error binding driver to the route.';
        console.error('Error:', err);
        alert(this.error);
      } finally {
        this.loading = false;
      }
    },

    // handle the change in selected line
    onLineChange() {
      this.selectedRoute = ''; // clear the selected route
      this.fetchRoutesForLine(); // fetch routes for the selected line
    },
  },
  created() {
  driverService.getDriverName()
    .then((name) => {
      this.name = name || "Driver"; // Fallback se o nome não estiver disponível
    })
    .catch((err) => {
      console.error("Failed to fetch driver name:", err);
      this.name = "Driver"; // Fallback em caso de erro
    });

  this.fetchLines(); // Fetch lines ao inicializar o componente
}
};
</script>

<style scoped>
  /* Fundo da página */
  body {
    margin: 0;
    font-family: Arial, sans-serif;
    background-color: #121212; /* Fundo escuro */
    color: #e0e0e0; /* Texto claro */
  }

  /* Contêiner principal */
  div {
    max-width: 600px;
    margin: 50px auto;
    padding: 20px;
    background-color: #1e1e1e; /* Fundo do componente */
    border-radius: 8px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  }

  /* Título */
  h1 {
    color: #ffffff;
    text-align: center;
    margin-bottom: 20px;
  }

  /* Mensagem de erro */
  .error {
    color: #ff6b6b;
    font-size: 0.9rem;
    margin-top: 10px;
    text-align: center;
  }

  /* Mensagem de informação */
  .info {
    color: #42b983;
    font-size: 0.9rem;
    margin-top: 10px;
    text-align: center;
  }

  /* Botões */
  button {
    display: block;
    width: 100%;
    padding: 10px;
    font-size: 1rem;
    border: none;
    border-radius: 4px;
    background-color: #6200ea;
    color: #ffffff;
    cursor: pointer;
    transition: background-color 0.3s;
  }

  button:hover {
    background-color: #3700b3;
  }

  button:disabled {
    background-color: #555;
    cursor: not-allowed;
  }

  /* Selects (comboboxes) */
  select {
    width: 100%;
    padding: 10px;
    font-size: 1rem;
    border: 1px solid #333;
    border-radius: 4px;
    background-color: #2c2c2c;
    color: #ffffff;
    margin-bottom: 15px;
    transition: border-color 0.3s ease, background-color 0.3s ease;
  }

  select:focus {
    outline: none;
    border-color: #6200ea;
    background-color: #3a3a3a;
  }
</style>

