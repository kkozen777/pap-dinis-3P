<template>
  <div class="app-container">
    <div class="settings-container"> 
      <button @click="toggleMenu" class="settings-button">
        <i class="settings-icon">⚙</i>
      </button>
      <div v-if="menuOpen" class="settings-menu">
        <button @click="goToSettings" class="menu-item">Security</button>
        <button @click="logout" class="menu-item">Logout</button>
      </div>
    </div>
    
    <div class="content-wrapper">
      <h1 class="title">Hello {{ name }}</h1>

      <div class="status-messages">
        <div v-if="loadingLines" class="info">Loading lines...</div>
        <div v-if="loadingRoutes" class="info">Loading routes...</div>
        <div v-if="!loadingRoutes && error" class="error">{{ error }}</div>
        <div v-if="!loadingRoutes && noRoutesMessage" class="info">{{ noRoutesMessage }}</div>
      </div>

      <div class="select-container">
        <select
          v-if="!loadingLines"
          v-model="selectedLine"
          class="select"
          @change="onLineChange"
        >
          <option value="" disabled>Select a line</option>
          <option v-for="line in lines" :key="line.id" :value="line.id">
            {{ line.name }}
          </option>
        </select>

        <select
          v-if="!loadingRoutes && routes.length > 0"
          v-model="selectedRoute"
          class="select"
        >
          <option value="" disabled>Select a route</option>
          <option v-for="route in routes" :key="route.id" :value="route.id">
            {{ route.start_time }}
          </option>
        </select>
      </div>

      <div v-if="selectedRoute">
        <button class="button" @click="bindDriverToRoute" :disabled="loading">
          Start !
        </button>
      </div>
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
      menuOpen: false,
      name: null, // name of the authenticated driver
      lines: [], // list of available lines
      routes: [], // list of routes for the selected line
      selectedLine: "", // id of the selected line
      selectedRoute: "", // id of the selected route
      loadingLines: false, // loading state for lines
      loadingRoutes: false, // loading state for routes
      error: null, // general error message
      noRoutesMessage: null, // specific message for "no routes available"
    };
  },

  methods: {
    toggleMenu() {
      this.menuOpen = !this.menuOpen;
    },
    goToSettings() {
      this.$router.push('/settings'); // redireciona para a página de settings
    },
    logout() {
      // log out the driver and redirect to the login page
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
        // call the service to bind the driver to the route
        await driverService.bindDriverToRoute(this.selectedRoute);

        alert('Successfully bound to the route!');
        this.$router.push('/tracking'); // redirect to the tracking page
      } catch (err) {
        this.error = err.message || 'Error binding to the route.';
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
      this.name = name || "Driver"; //  se o nome não estiver disponível
    })
    .catch((err) => {
      console.error("Failed to fetch driver name:", err);
      this.name = "Driver"; // caso de erro
    });

  this.fetchLines(); // Fetch lines ao inicializar
}
};
</script>

<style scoped>
.app-container {
  max-width: 600px;
  margin: 40px auto;
  padding: 20px;
  background-color: #1e1e1e;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  gap: 30px; /* Mais espaço entre os elementos */
  position: relative;
}

.settings-container {
  position: absolute;
  top: 10px;
  right: 10px;
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px; /* Espaço entre os elementos internos */
}

.info {
  color: #42b983;
  text-align: center;
  font-size: 0.95rem;
  margin: 10px 0;
}
select:focus {
  outline: none;
  border-color: #00c6ff;
  background-color: #3b3b3b;
}
.error {
  color: #ff6b6b;
  text-align: center;
  font-size: 0.95rem;
  margin: 10px 0;
}
.status-messages {
  display: flex;
  flex-direction: column;
  gap: 10px; /* Espaço entre mensagens de status */
}

.select-container {
  display: flex;
  flex-direction: column;
  gap: 15px; /* Espaço entre os selects */
}

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
.menu-item:hover {
  background-color: #444;
}

.menu-item:active {
  background-color: #009bd3;
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
.settings-button:hover {
  background-color: #009bd3;
}

.settings-button:active {
  transform: scale(0.9); /* Button click animation */
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
</style>
