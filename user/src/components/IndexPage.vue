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

    <!-- Details of the selected route -->
    <div v-if="selectedRoute">
      <h3>Selected Route Details</h3>
      <p><strong>Status</strong> {{ selectedRouteDetails.status }}</p>
      <p><strong>Start Time:</strong> {{ selectedRouteDetails.start_time }}</p>
      <p><strong>End Time:</strong> {{ selectedRouteDetails.end_time }}</p>
    </div>

    <!-- Button to search -->
    <div v-if="selectedRoute || selectedLine">
      <button @click="searchRoute" :disabled="loading">
        Search
      </button>
    </div>
  </div>
</template>

<script>
import authService from "@/services/authService";
import linesService from "@/services/linesService";
import routesService from "@/services/routesService";

export default {
  data() {
    return {
      name: null,
      lines: [],
      routes: [],
      selectedLine: "",
      selectedRoute: "",
      selectedRouteDetails: {},
      loadingLines: false,
      loadingRoutes: false,
      error: null,
      noRoutesMessage: null, // Specific message for "No routes available"
    };
  },
  methods: {
    logout() {
      try {
        const response = authService.logout(); // Calls the logout method from the service
        if (response){
          this.$router.push('/');
        }else{
          alert("erro!")
        }
        
      } catch (error) {
        this.error = "Error while logging out. Please try again.";
      }
    },
    // Fetches the lines from the API
    async fetchLines() {
      this.loadingLines = true;
      this.error = null;
      try {
        const response = await linesService.getLines();
        this.lines = response.data; // Assuming the response returns an array of lines
      } catch (err) {
        this.error = "Failed to load lines. Please try again later.";
        console.error(err);
      } finally {
        this.loadingLines = false;
      }
    },
    async searchRoute() {
      if (!this.selectedRoute || !this.selectedLine) {
        alert("Por favor, selecione uma linha e uma rota.");
        return;
      }

      try {
        // Verifica os detalhes da rota antes de continuar
        const response = await routesService.getRouteDetails(this.selectedRoute);
        const routeDetails = response.data.route;
        // Verifica o status da rota
        if (routeDetails.status !== "1") {
          alert("A rota selecionada não está ativa.");
          return;
        }

        // Redireciona para a página do mapa com o ID da rota como parâmetro
        this.$router.push({
          name: "MapPage",
          params: { routeId: this.selectedRoute },
        });
      } catch (err) {
        console.error("Erro ao verificar os detalhes da rota:", err);
        alert("Falha ao verificar os detalhes da rota. Tente novamente mais tarde.");
      }
    },
    // Fetches the routes for the selected line
    async fetchRoutesForLine() {
      if (!this.selectedLine) {
        this.routes = [];
        this.error = null;
        return;
      }

      this.loadingRoutes = true;
      this.error = null;
      this.routes = [];
      this.noRoutesMessage = null; // To prevent the "no routes" message from always showing

      try {
        const response = await routesService.getRoutesByLineId(this.selectedLine);
        this.routes = response.data.data;
      } catch (err) {
        // Checks if the error is a 404 (not found)
        if (err.response && err.response.status === 404) {
          // If it's 404, assumes no routes available and shows the "no routes" message
          this.error = null;
          this.noRoutesMessage = `No routes available for the selected line.`;
          console.log("no routes");
        } else {
          // For other types of errors, set a default error message
          this.error = "Failed to load routes. Please try again later.";
          this.noRoutesMessage = null; // Make sure to clear "No routes" messages
          console.error("Error loading routes:", err);
        }
      } finally {
        this.loadingRoutes = false; // Ends the loading state
      }
    },

    // Fetches the details of the selected route
    async fetchRouteDetails() {
      if (!this.selectedRoute) {
        this.selectedRouteDetails = {};
        return;
      }

      try {
        const response = await routesService.getRouteDetails(this.selectedRoute);
        this.selectedRouteDetails = response.data.route; // Corrected to access 'route'
        console.log("Route details loaded:", this.selectedRouteDetails);
      } catch (err) {
        this.error = "Failed to load route details. Please try again later.";
        this.selectedRouteDetails = {}; // Clears old details in case of error
        console.error(err);
      }
    },
    // Handles the line change event
    onLineChange() {
      this.selectedRoute = ""; // Resets the selected route when changing the line
      this.routes = []; // Resets the routes when changing the line
      this.error = null; // Clears error messages when changing the line
      this.fetchRoutesForLine(); // Loads the routes for the new line
    },
  },
  watch: {
    // Watches changes in the selected route to fetch the details
    selectedRoute() {
      this.fetchRouteDetails();
    },
  },
  created() {
    if (this.isAuthenticated) {
      this.name = authService.getTokenValue("name"); // Extracts the name from the token
    }
    this.fetchLines(); // Loads the lines when the component is created
  },
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

/* Detalhes da rota */
h3 {
  color: #ffffff;
  margin-top: 20px;
}

p {
  color: #b0b0b0;
  font-size: 1rem;
  margin: 5px 0;
}

strong {
  color: #e0e0e0;
}
</style>
