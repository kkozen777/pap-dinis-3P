<template>
  <div id="app">
    <div class="coordinates">
      <p>Latitude: {{ latitude || 'Loading latitude...' }} | Longitude: {{ longitude || 'Loading longitude...' }}</p>
    </div>
    <button @click="endRoute" :disabled="loading">
      {{ loading ? 'Ending the route...' : 'End Route' }}
    </button>
  </div>
</template>

<script>
import locationsService from '@/services/locationsService';
import driverService from '@/services/driverService';

export default {
  data() {
    return {
      latitude: null,
      longitude: null,
      watchId: null,
      loading: false,
      locationInterval: null,
      statusInterval: null, // Separar os intervalos
    };
  },
  async mounted() {
  try {
    await this.startTrackingLocation();
    this.locationInterval = setInterval(() => this.trackLocation(), 10000); // Envia localização a cada 10s
    this.statusInterval = setInterval(() => {
      console.log('Verificando o status da rota a cada 20 segundos...');
      this.checkRouteStatus();
    }, 20000); // Verifica status a cada 20s
  } catch (err) {
    console.error('Erro ao iniciar o rastreamento:', err);
    alert('Erro ao iniciar o rastreamento.');
    this.$router.push('/driver');
  }
},

  beforeUnmount() {
    this.clearIntervals();
  },
  methods: {
    clearIntervals() {
      if (this.locationInterval) clearInterval(this.locationInterval);
      if (this.statusInterval) clearInterval(this.statusInterval);
    },

    async startTrackingLocation() {
      const token = localStorage.getItem('authToken');
      try {
        const response = await driverService.getDriverStatus(token);

        if (response?.data?.status) {
          this.trackLocation(); // Rastreia a localização inicial
        } else {
          alert('Driver is not on an active route.');
          this.$router.push('/driver');
        }
      } catch (err) {
        console.error('Error checking route status:', err);
        throw new Error('Failed to initialize tracking.');
      }
    },

    trackLocation() {
      if (!navigator.geolocation) {
        alert('Geolocation not supported by the browser.');
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;

          if (this.latitude !== latitude || this.longitude !== longitude) {
            this.latitude = latitude;
            this.longitude = longitude;

            console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);
            this.sendLocation(latitude, longitude);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          if (error.code === error.PERMISSION_DENIED) {
            alert('Location permission denied.');
            this.endRoute();
          }
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    },

    async checkRouteStatus() {
      const token = localStorage.getItem('authToken');
      try {
        const response = await driverService.getDriverStatus(token);
        const isRouteActive = response?.data?.status;

        if (!isRouteActive) {
          console.log('Route has ended.');
          this.clearIntervals();
          alert('Route has been ended.');
          this.$router.push('/driver');
        }
      } catch (err) {
        console.error('Error checking route status:', err);
      }
    },

    async sendLocation(latitude, longitude) {
      try {
        await locationsService.sendLocation(latitude, longitude);
        console.log('Location sent successfully!');
      } catch (err) {
        console.error('Error sending location:', err);
        alert('Error sending location.');
      }
    },

    async endRoute() {
      this.loading = true;
      try {
        await driverService.endRoute();
        alert('Route successfully ended!');
        this.$router.push('/driver');
      } catch (err) {
        console.error('Error ending route:', err);
        alert('Error ending route.');
      } finally {
        this.loading = false;
        this.clearIntervals();
      }
    },
  },
};
</script>

<style scoped>
#app {
  font-family: Arial, sans-serif;
  padding: 20px;
  text-align: center;
}

.coordinates {
  font-size: 16px;
  margin-bottom: 20px;
  color: #ffffff;
}

button {
  padding: 10px 20px;
  background-color: #00c6ff;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

button:hover:not(:disabled) {
  background-color: #0056b3;
}
</style>
