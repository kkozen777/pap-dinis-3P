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
// Importando os serviços necessários
import locationsService from '@/services/locationsService';
import driverService from '@/services/driverService';

export default {
  data() {
    return {
      latitude: null,
      longitude: null,
      watchId: null,
      loading: false,
      statusCheckInterval: null,  // Para verificar o status da rota
      locationInterval: null,     // Para enviar a localização a cada 10 segundos
    };
  },
  async mounted() {

    await this.startTrackingLocation();
    await this.checkRouteStatus();
    this.locationInterval = setInterval(() => {
      this.startTrackingLocation();
      this.checkRouteStatus();
      console.log("a enviar localizacao...")
    }, 1000); // fazer a cada 10 segundos para testes, mas ao entregar atualizar para 20
  },
  beforeUnmount() {
    if (this.watchId) {
      clearInterval(this.watchId); // Limpar o intervalo para rastrear a localização
    }
    if (this.statusCheckInterval) {
      clearInterval(this.statusCheckInterval); // Limpar o intervalo para verificar o status da rota
    }
    if (this.locationInterval) {
      clearInterval(this.locationInterval); // Limpar o intervalo de envio de localização
    }
  },
  methods: {
    // Verifica se o motorista está em uma rota ativa
    async startTrackingLocation() {
      const token = localStorage.getItem('authToken');
      try {
        const response = await driverService.getDriverStatus(token);
        const hasActiveRoute = response.data;

        if (hasActiveRoute) {
          // Se o motorista tem uma rota ativa, começa a rastrear a localização
          this.trackLocation();
          this.checkRouteStatus();
        } else {
          alert('Driver is not on an active route.');
          this.$router.push("/driver");
        }
      } catch (err) {
        console.error('Error checking route status:', err);
      }
    },

    // Rastreia a localização do motorista
    trackLocation() {
      if (!navigator.geolocation) {
        alert('Geolocation not supported by the browser.');
        return;
      }
      
    // Configura um intervalo para rastrear a localização a cada 10 segundos
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;

          // Atualiza as coordenadas apenas se tiverem mudado
          if (this.latitude !== latitude || this.longitude !== longitude) {
            this.latitude = latitude;
            this.longitude = longitude;

            console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);

            // Envia a nova localização para o backend
            this.sendLocation(latitude, longitude);
          }
        },
        (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            // Usuário recusou o acesso à localização
            console.log("hello world");
            driverService.endRoute();
            this.$router.push("/driver");
          } else {
            console.error('Error getting location:', error);
            alert("Não foi possível obter a localização.");
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 100000,  // Tempo máximo de espera para obter a localização
          //  maximumAge: 0,   // Não usar localização armazenada em cache
        }
      );
    },

    // Verifica o status da rota a cada 10 segundos
    async checkRouteStatus() {
      try {
        const token = localStorage.getItem('authToken');
        const response = await driverService.getDriverStatus(token);
        const isRouteActive = response.data.status;

        // Se o status da rota for falso, interrompe os intervalos e redireciona
        if (!isRouteActive || isRouteActive == null) {
          console.log('Route has been ended.');
          clearInterval(this.locationInterval);  // Para de enviar a localização
          clearInterval(this.statusCheckInterval);  // Para de verificar o status da rota
          alert('Route has been ended.');
          this.$router.push('/driver'); 
        }
      } catch (err) {
        console.error('Error checking route status:', err);
      }
    },

    // Envia a localização para o backend
    async sendLocation(latitude, longitude) {
      try {
        await locationsService.sendLocation(latitude, longitude);
        console.log('Location sent successfully!');
      } catch (err) {
        console.error(err.message);
        alert('Error sending location.');
      }
    },

    // Finaliza a rota do motorista
    async endRoute() {
      this.loading = true;
      try {
        await driverService.endRoute();
        alert('Route successfully ended!');
        this.$router.push('/driver');
      } catch (err) {
        console.error(err.message);
        alert(err.message);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
<!-- o scoped serve para fazer com que este css 
seja aplicado apenas a esta pagina -->
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
    background-color: #007bff;
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

