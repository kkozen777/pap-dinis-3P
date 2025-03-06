<template>
  <div id="app">
    <div class="coordinates">
      <!-- Exibe as coordenadas latitude e longitude ou mensagem de carregamento -->
      <p>Latitude: {{ latitude || 'Loading latitude...' }} | Longitude: {{ longitude || 'Loading longitude...' }}</p>
    </div>
    <!-- Botão para finalizar a rota -->
    <button @click="endRoute" :disabled="loading">
      {{ loading ? 'Ending the route...' : 'End Route' }}
    </button>
  </div>
</template>

<script>
// Importação dos serviços para lidar com a localização e estado do motorista
import locationsService from '@/services/locationsService';
import driverService from '@/services/driverService';

export default {
  data() {
    return {
      latitude: null, // guarda a latitude
      longitude: null, // guarda a longitude
      loading: false, // Controla o estado de carregamento do botão de finalizar rota
      locationInterval: null, // Intervalo para rastrear a localização
      statusInterval: null, // Intervalo para verificar o status da rota
      //ou seja, caso haja algum problema e o motorista não esteja realmente naquela rota
      //foi criado para segurança
    };
  },

  async mounted() {
    try {
      // Inicia o rastreamento de localização e configura intervalos para enviar localização e verificar status
      await this.startTrackingLocation();
      this.locationInterval = setInterval(() => this.trackLocation(), 3); // Envia localização a cada 10s
      this.statusInterval = setInterval(() => {
        // Verifica o status da rota a cada 3 segundos
        this.checkRouteStatus();
      }, 3000);
    } catch (err) {
      console.error('Error starting the tracking:', err);
      alert('Error starting the tracking, please try again.');
      this.$router.push('/driver'); // Redireciona para a página do motorista se ocorrer erro
    }
  },

  beforeUnmount() {
    this.clearIntervals(); // Limpa os intervalos para evitar erros
  },

  methods: {
    // Limpa os intervalos de localização e status
    clearIntervals() {
      if (this.locationInterval) clearInterval(this.locationInterval); // Limpa o intervalo de localização
      if (this.statusInterval) clearInterval(this.statusInterval); // Limpa o intervalo de status
    },

    // para confirmar o inico do rastreamento, criada por seguranca e correção de erros
    async startTrackingLocation() {
      const token = localStorage.getItem('authToken'); // Obtém o token de autenticação
      try {
        // Verifica se o motorista está numa rota ativa
        const response = await driverService.getDriverStatus(token);

        if (response?.data?.status) {
          this.trackLocation(); // Inicia o rastreamento se o motorista estiver numa rota ativa
        } else {
          alert('Driver is not on an active route.');
          this.$router.push('/driver'); // Redireciona se o motorista não estiver numa rota ativa
        }
      } catch (err) {
        console.error('Error checking route status:', err); 
        throw new Error('Failed to initialize tracking.'); // erro se não conseguir iniciar o rastreamento
      }
    },

    // Rastreamento da localização do motorista
    trackLocation() {
      if (!navigator.geolocation) {
        alert('Geolocation not supported by the browser.');
        this.$router.push('/driver'); // Redireciona se o navegador não suportar geolocalização
      }

      // Obtém a posição atual do motorista
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          
          // Atualiza as coordenadas apenas se houver mudanças
          //ou seja, se o autocarro estiver parado, a localização não é enviada
          if (this.latitude !== latitude || this.longitude !== longitude) {
            this.latitude = latitude;
            this.longitude = longitude;
            this.sendLocation(latitude, longitude); // Envia a localização para o servidor
          }

          // Verifica a precisão da localização
          if (accuracy > 50) {
            console.warn(`Ignored location: low accuracy (${accuracy}m)`); // Se a precisão for baixa, ignora
            return;
          }

          // Verifica se a mudança na localização é muito brusca (mais de 100 metros)
          // isto é útil pois muitas vezes a localização do motorista não era de todo precisa
          if (this.latitude && this.longitude) {
            const distance = this.getDistanceFromLatLonInKm(
              this.latitude,
              this.longitude,
              latitude,
              longitude
            ) * 1000; // Converte a distância de quilômetros para metros

            if (distance > 100) { // Ignora se o motorista moveu mais de 100 metros
              console.warn(`Ignored location: unrealistic jump of ${distance.toFixed(1)}m`);
              return;
            }
          }

          // Atualiza as coordenadas se tudo estiver correto
          this.latitude = latitude;
          this.longitude = longitude;

          // console.log(`Updated Location -> Lat: ${latitude}, Lng: ${longitude}, Accuracy: ${accuracy}m`);
          this.sendLocation(latitude, longitude); // Envia a localização para a api atraves dessa função
        },
        (error) => {
          console.error('Error getting location:', error);
          if (error.code === error.PERMISSION_DENIED) {
            alert('Location permission denied.');
            this.endRoute(); // Se a permissão a localização for negada, finaliza a rota
          }
        },
        { enableHighAccuracy: true, timeout: 3000, maximumAge: 5000 } 
      );
    },

    // Verifica se a rota ainda está ativa
    async checkRouteStatus() {
      try {
        const response = await driverService.getDriverStatus();
        const isRouteActive = response?.data?.status;

        if (!isRouteActive) { //  caso não esteja em uma rota
          this.clearIntervals(); // Limpa os intervalos se a rota foi finalizada
          alert('Route has been ended.');
          this.$router.push('/driver'); // Redireciona para a página do motorista
        }
      } catch (err) {
        console.error('Error checking route status:', err); // Regista erro no console
      }
    },

    // Envia a localização para o servidor
    async sendLocation(latitude, longitude) {
      try {
        await locationsService.sendLocation(latitude, longitude); // Envia os dados de localização
        // console.log('Location sent successfully!'); // Confirma o envio bem-sucedido
      } catch (err) {
        console.error('Error sending location:', err); // Regista erro no envio
        alert('Error sending location.'); // Exibe alerta em caso de erro
      }
    },

    // Finaliza a rota
    async endRoute() {
      this.loading = true; // Ativa o estado de carregamento do botão
      try {
        await driverService.endRoute(); // Finaliza a rota através do serviço
        alert('Route successfully ended!'); // Alerta de sucesso ao finalizar
        this.$router.push('/driver'); // Redireciona para a página do motorista
      } catch (err) {
        console.error('Error ending route:', err); // Regista erro ao finalizar a rota
        alert('Error ending route.'); // Alerta de erro ao finalizar a rota
      } finally {
        this.loading = false; // Desativa o estado de carregamento
        this.clearIntervals(); // Limpa os intervalos
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
