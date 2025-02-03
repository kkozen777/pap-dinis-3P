<template>
  <div class="app-container">
    <!-- Header Section -->
    <header>
      <div class="settings-container">
        <button @click="toggleMenu" class="settings-button">
          <i class="settings-icon">⚙</i>
        </button>
        <div v-if="menuOpen" class="settings-menu">
          <button @click="goToSettings" class="menu-item">Security</button>
          <button @click="logout" class="menu-item">Logout</button>
        </div>
      </div>
      <h1>Welcome {{ name }}</h1>
    </header>

    <!-- Main Content Section -->
    <main>
      <!-- Loading States -->
      <div v-if="loadingLines" class="loading">Loading lines...</div>
      <div v-if="loadingRoutes" class="loading">Loading routes...</div>

      <!-- Error and Info Messages -->
      <div v-if="!loadingRoutes && error" class="error">{{ error }}</div>
      <div v-if="!loadingRoutes && noRoutesMessage" class="info">
        {{ noRoutesMessage }}
      </div>

      <!-- Line Search Input -->
      <section v-if="!loadingLines">
        <label for="line-input" class="line-label">Select a Line:</label>
        <input
          id="line-input"
          v-model="searchTerm"
          @focus="showSuggestions = true"
          @blur="hideSuggestionsWithDelay"
          placeholder="Start typing a line..."
          class="line-input"
        />
        
        <!-- Dropdown Suggestions -->
        <ul v-if="showSuggestions && filteredLines.length" class="suggestions">
          <li 
            v-for="line in filteredLines" 
            :key="line.id" 
            @mousedown.prevent="selectLine(line)"
          >
            {{ line.name }}
          </li>
        </ul>
      </section>

      <!-- Display Schedules -->
      <section v-if="selectedLine && selectedLine.schedules">
        <h3>
          <a :href="selectedLine.schedules" target="_blank">link: Schedules</a>
        </h3>
      </section>

      <!-- Route Selection -->
      <select
      v-if="!loadingRoutes && routes.length > 0"
      v-model="selectedRoute"
      class="select"
    >
      <option :value="null" disabled>Select a route</option>
      <option v-for="route in routes" :key="route.id" :value="route.id">
        {{ route.start_time }}
      </option>
    </select>



      <!-- Selected Route Details -->
      <section v-if="selectedRoute">
        <h3>Selected Route Details</h3>
        <p><strong>Status:</strong>
          <span v-if="selectedRouteDetails.status === '1'" class="running-status">
            Running!
            <span class="status-icon">🟢</span>
          </span>
          <span v-else class="stopped-status">
            Stopped!
            <span class="status-icon">🔴</span>
          </span>
        </p>
          <p v-if="selectedRouteDetails.status === '1'"><strong>Has began at:</strong> {{ route_started_at }}</p>
          <p v-else><strong>Begans at:</strong> {{ selectedRouteDetails.start_time }}</p>
          <p><strong>Ends at:</strong> {{ selectedRouteDetails.end_time }}</p>
      </section>

      <!-- Search Button -->
      <section v-if="selectedRoute || selectedLine">
        <button @click="searchRoute" :disabled="loading">Search</button>
      </section>
    </main>
  </div>
</template>

<script>
import authService from "@/services/authService";
import linesService from "@/services/linesService";
import routesService from "@/services/routesService";
import userService from "@/services/userService";

export default {
  data() {
    return {
      name: null,
      lines: [],
      searchTerm: "",
      selectedLine: null,
      showSuggestions: false,
      routes: [],
      selectedRoute: "",
      selectedRouteDetails: {},
      loadingLines: false,
      loadingRoutes: false,
      loading: false,
      error: null,
      noRoutesMessage: null,
      menuOpen: false,
      route_started_at: "",
    };
  },
  computed: {
    //funcao para mostrar as linhas ao pesquisar
    filteredLines() {
      return this.lines.filter(line =>
        line.name.toLowerCase().includes(this.searchTerm.toLowerCase()) //para nao distinguir entre maiusculas e minusculas
      );
    },
  },
  methods: {
    async getStarted_at(){
      try {
        const response = await routesService.getRouteStarted_At(this.selectedRouteDetails.id);
        this.route_started_at = response.data || "Error getting the moment that the route began at.";
        console.log(response )
      } catch (err) { 
        console.error("Failed get routeStartedAt", err);
      }
    },
    //ver todas as linhas
    async fetchLines() {
      this.loadingLines = true;
      try {
        const response = await linesService.getLines();
        this.lines = response.data || [];
      } catch (err) {
        console.error("Failed to load lines", err);
      } finally {
        this.loadingLines = false;
      }
    },
    //mostrar as rotas da linha escolhida
    async fetchRoutesForLine() {
      if (!this.selectedLine) {
        this.routes = [];
        this.error = null;
        return;
      }

      this.loadingRoutes = true;
      this.error = null;
      this.routes = [];
      this.noRoutesMessage = null;

      try {
        const response = await routesService.getRoutesByLineId(this.selectedLine.id);
        this.routes = response.data.data;
      } catch (err) {
        if (err.response && err.response.status === 404) {
          this.error = null;
          this.noRoutesMessage = "No routes available for the selected line.";
        } else {
          this.error = "Failed to load routes. Please try again later.";
          console.error("Error loading routes:", err);
        }
      } finally {
        this.loadingRoutes = false;
        //caso a linha nao tenha rotas
        if (this.routes.length === 0) {
          this.selectedRoute = null;
          this.selectedRouteDetails = null;
        }
      }
    },
    selectLine(line) {
      this.selectedLine = line;
      this.searchTerm = line.name;
      this.showSuggestions = false;

      this.fetchRoutesForLine();
      this.selectedRoute = null;
      this.selectedRouteDetails = null;
    },
    async fetchRouteDetails() {
      if (!this.selectedRoute) {
        this.selectedRouteDetails = {};
        return;
      }

      try {
        const response = await routesService.getRouteDetails(this.selectedRoute);
        this.selectedRouteDetails = response.data.route;
        if(this.selectedRouteDetails.status == '1'){
          this.getStarted_at();
          console.log("hello")
        }
      } catch (err) {
        this.error = "Failed to load route details. Please try again later.";
        console.error(err);
      }
    },
    //tempo para caso nenhum caracter corresponda a linha pesquisada
    hideSuggestionsWithDelay() {
      setTimeout(() => {
        this.showSuggestions = false;
      }, 200);
    },
    async goToSettings() {
      this.$router.push("/settings");
    },
    //muda a variavel para abrir o menu
    toggleMenu() {
      this.menuOpen = !this.menuOpen;
    },
    logout() {
      authService.logout();
      this.$router.push("/");
    },
    async searchRoute() {
      if (!this.selectedRoute || !this.selectedLine) {
        alert("Please select a line and a route.");
        return;
      }

      try {
        const response = await routesService.getRouteDetails(this.selectedRoute);
        const routeDetails = response.data.route;
        //verifica se a rota realmente esta ativa
        if (routeDetails.status !== "1") {
          alert("The selected route is not active.");
          return;
        }

        this.$router.push({
          name: "MapPage",
          params: { routeId: this.selectedRoute },
        });
      } catch (err) {
        console.error("Error checking route details:", err);
        alert("Failed to check route details. Please try again later.");
      }
    },
  },
  watch: {
    selectedRoute() {
      this.fetchRouteDetails();
    },
  },
  created() {
    userService.getUserName()
      .then(name => {
        this.name = name || "User";
      })
      .catch(err => {
        console.error("Failed to fetch user name:", err);
        this.name = "User";
      });

    this.fetchLines();
  },
};
</script>


<style scoped>
/* General Styling */
body {
  margin: 0;
  font-family: 'Arial', sans-serif;
  background-color: #1e1e1e;
  color: #e0e0e0;
  line-height: 1.6;
}

/* App Container */
.app-container {
  max-width: 600px;
  margin: 40px auto;
  padding: 20px;
  background-color: #1e1e1e;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Header */
header {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
}

header h1 {
  color: #ffffff;
  margin: 0;
  font-size: 1.5rem;
  text-align: center;
}
.menu-item {
  display: block;
  padding: 8px;
  color: #fff;
  cursor: pointer;
}

.line-label {
  display: block;
  margin-bottom: 10px;
}

.line-input {
  width: 90%;
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #444;
  background: #333;
  color: #fff;
}

.suggestions {
  list-style: none;
  background: #444;
  padding: 0;
  border-radius: 5px;
  margin-top: 5px;
}

.suggestions li {
  padding: 10px;
  cursor: pointer;
}

.suggestions li:hover {
  background: #555;
}
.settings-button {
  position: absolute;
  top: 0;
  right: 0;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background-color: #00c6ff;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.2rem;
  cursor: pointer;
  transition: transform 0.2s ease, background-color 0.3s ease;
}

.settings-button:hover {
  background-color: #009bd3;
}

.settings-button:active {
  transform: scale(0.9); /* Button click animation */
}

.settings-menu {
  position: absolute;
  top: 50px;
  right: 0;
  background-color: #2b2b2b;
  border: 1px solid #444;
  border-radius: 5px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.4);
  z-index: 1000;
  overflow: hidden;
}

.settings-icon {
  font-style: normal; /* Prevents any italic styling */
}

.menu-item {
  width: 100%;
  padding: 10px 20px;
  text-align: left;
  background-color: #2b2b2b;
  color: #ffffff;
  font-size: 1rem;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.menu-item:hover {
  background-color: #444;
}

.menu-item:active {
  background-color: #009bd3;
}

/* Main Content */
main {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Labels */
label {
  display: block;
  margin-bottom: 8px;
  font-size: 1rem;
}

.line-label {
  color: #ffffff;
}

/* Select Dropdowns */
select {
  width: 100%;
  padding: 10px;
  border: 1px solid #444;
  border-radius: 5px;
  background-color: #2b2b2b;
  color: #ffffff;
  font-size: 1rem;
  transition: border-color 0.3s, background-color 0.3s;
}

select:focus {
  outline: none;
  border-color: #00c6ff;
  background-color: #3b3b3b;
}

/* Error message */
.error {
  color: #ff6b6b;
  text-align: center;
  font-size: 0.95rem;
  margin: 10px 0;
}

/* Info message */
.info {
  color: #42b983;
  text-align: center;
  font-size: 0.95rem;
  margin: 10px 0;
}

/* Buttons */
button {
  width: 100%;
  padding: 12px;
  font-size: 1rem;
  border: none;
  border-radius: 5px;
  background-color: #00c6ff;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.3s ease-in-out;
}

button:hover {
  background-color: #009bd3;
}

button:disabled {
  background-color: #444;
  cursor: not-allowed;
}

/* Footer */
footer {
  text-align: center;
}

.footer-button {
  width: 100%;
}

a {
  color: rgb(122, 186, 225);
  text-decoration: none; /* Remove o sublinhado, opcional */
}

a:hover {
  text-decoration: underline; /* Adiciona um sublinhado ao passar o mouse, opcional */
}
</style>
