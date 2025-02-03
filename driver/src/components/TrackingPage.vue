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
      statusInterval: null,
    };
  },
  async mounted() {
  try {
    await this.startTrackingLocation();
    this.locationInterval = setInterval(() => this.trackLocation(), 10000); // Envia localização a cada 10s
    this.statusInterval = setInterval(() => {
      // console.log('Verifying route status 10 seconds');
      this.checkRouteStatus();
    }, 3000); // verifica status a cada 20s
  } catch (err) {
    console.error('Error starting the tracking:', err);
    alert('Error starting the tracking, please try again.');
    this.$router.push('/driver');
  }
},

  beforeUnmount() {
    this.clearIntervals();
  },
  methods: {
    clearIntervals() {
      if (this.locationInterval) clearInterval(this.locationInterval); // limpar os valores, para nao haver erros
      if (this.statusInterval) clearInterval(this.statusInterval);
    },
    // para comecar a rastrear
    async startTrackingLocation() {
      const token = localStorage.getItem('authToken');
      try {
        const response = await driverService.getDriverStatus(token);

        if (response?.data?.status) {
          this.trackLocation();
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
        this.$router.push('/driver');
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          //atualizar apenas se a longitude e latitude nao tiver mudado
          const { latitude, longitude, accuracy } = position.coords;
          if (this.latitude !== latitude || this.longitude !== longitude) {
            this.latitude = latitude;
            this.longitude = longitude;
            // console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);
            this.sendLocation(latitude, longitude);
          }

          // Scrip para caso a precisao da localizacao recebida nao esteja consistente
          // Feito para corrigir o autocarro a teletransportar-se as vezes
          if (accuracy > 50) {
            console.warn(`Ignored location: low accuracy (${accuracy}m)`);
            return;
          }

          // script para evitar mudanças muito bruscas
          if (this.latitude && this.longitude) {
            const distance = this.getDistanceFromLatLonInKm(
              this.latitude,
              this.longitude,
              latitude,
              longitude
            ) * 1000; // converter lkm para metros

            if (distance > 100) { // Se o motorista mudou mais de 100m, ignorar
              console.warn(`Ignored location: unrealistic jump of ${distance.toFixed(1)}m`);
              return;
            }
          }

          // apenas atualizar localização se passar nos filtros
          this.latitude = latitude;
          this.longitude = longitude;

          console.log(`Updated Location -> Lat: ${latitude}, Lng: ${longitude}, Accuracy: ${accuracy}m`);
          this.sendLocation(latitude, longitude);
        },
        (error) => {
          console.error('Error getting location:', error);
          if (error.code === error.PERMISSION_DENIED) {
            alert('Location permission denied.');
            this.endRoute();
          }
        },
        { enableHighAccuracy: true, timeout: 3000, maximumAge: 5000 } // mais timeout para uma precisão melhor
      );
    },
    async checkRouteStatus() {
      try {
        const response = await driverService.getDriverStatus();
        const isRouteActive = response?.data?.status;

        if (!isRouteActive) {
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
    // Script to put all the stops in the map
    // trackLocation() {
    //   if (!navigator.geolocation) {
    //     alert('Geolocation not supported by the browser.');
    //     return;
    //   }

    //   navigator.geolocation.getCurrentPosition(
    //     (position) => {
    //       const { latitude, longitude } = position.coords;

    //       if (this.latitude !== latitude || this.longitude !== longitude) {
    //         this.latitude = latitude;
    //         this.longitude = longitude;

    //         console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);
    //         this.sendLocation(latitude, longitude);
    //       }
    //     },
    //     (error) => {
    //       console.error('Error getting location:', error);
    //       if (error.code === error.PERMISSION_DENIED) {
    //         alert('Location permission denied.');
    //         this.endRoute();
    //       }
    //     },
    //     { enableHighAccuracy: true, timeout: 10000 }
    //   );
    // },
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
