<template>
  <link
    href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css"
    rel="stylesheet"
  />
  <div class="map-container">
    <!-- Mapa -->
    <div id="map" ref="map"></div>

    <!-- Menu de botões na parte inferior -->
    <div class="menu-container">
      <div class="button-container">
        <button @click="goBack" class="circle-button">
          <i class="fas fa-arrow-left"></i>
        </button>
        <button @click="goToTheBus" class="circle-button">
          <i class="fas fa-bus"></i>
        </button>
        <button @click="goToUserLocation" class="circle-button">
          <i class="fas fa-map-marker-alt"></i>
        </button>
      </div>
    </div>
  </div>
</template>


<script>
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import locationService from "@/services/locationsService";
import pathService from "@/services/pathService"
import busStopPng from "@/assets/busStop.png";
import busIconPng from "@/assets/busPng.png";
import userLocationPng from "@/assets/userLocationPng.png";

export default {
  name: "MapPage",
  props: ["routeId"],
  data() {
    return {
      map: null,
      busMarker: null,
      userLocationMarker: null,
      RouteId: this.routeId,
      busStopsLayer: L.layerGroup(),
      markers: [],
      updateInterval: null, 
    };
  },
  watch: {
    routeId(newId) {
      this.RouteId = newId;
    },
  },
  async mounted() {
    try {
      this.initializeMap();
      await this.loadInitialData();

      this.updateInterval = setInterval(async () => {
        await this.fetchLatestLocation();
        await this.getUserLocation();
      }, 6000); // Atualiza a localização a cada 1 segundo
    } catch (error) {
      console.error("Erro ao montar o componente:", error);
    }
  },
  beforeUnmount() {
    if (this.map) {
      this.map.off();
      this.map.eachLayer((layer) => {
        this.map.removeLayer(layer);
      });
      this.map = null;
    }

    if (this.updateInterval) {
      clearInterval(this.updateInterval); // Limpa o intervalo
      this.updateInterval = null;
    }
  },
  methods: {
    // Inicialização do mapa
    initializeMap() {
      this.map = L.map(this.$refs.map, {
        zoomControl: false,
        zoom: 14,
      }).setView([41.3436, -8.4776], 14);

      L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
          minZoom: 7,
        }
      ).addTo(this.map);

      // Remover a marcação de atribuição
      const mapAttribution = document.querySelector('.leaflet-control-attribution');
      if (mapAttribution) {
        mapAttribution.style.display = 'none';
      }

      this.busStopsLayer.addTo(this.map);
      this.map.on("zoomend", this.checkZoomLevel); // Verifica o nível de zoom
    },

    // Carrega os dados iniciais
    async loadInitialData() {
      // await this.fetchBusStops();
      await this.fetchLatestLocation();
      await this.getUserLocation();
      await this.goToTheBus();
      await this.drawRoute(); // Desenha a rota no mapa
    },

    calculateDistance(lat1, lon1, lat2, lon2) {
      const R = 6371; // Raio da Terra em km
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;

      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);

      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c; // Distância em km
    },

    formatDistance(distanceInKm) {
      const distanceInMeters = distanceInKm * 1000; // Converter de volta para metros

      if (distanceInMeters < 1000) {
        // Se a distância for menor que 1000 metros, exibe em metros
        return `${Math.round(distanceInMeters)} metros`;
      } else {
        // Se a distância for maior ou igual a 1000 metros, exibe em quilômetros com uma casa decimal
        const distanceInKmFormatted = distanceInKm.toFixed(1);
        return `${distanceInKmFormatted} km`;
      }
    },
    async drawRoute() {
      try {
        const path = await pathService.getRoutePath(this.RouteId);

        if (!path || !path.route.coordinates) {
          throw new Error("Nenhuma rota encontrada para este ID.");
        }

        const coordinates = JSON.parse(path.route.coordinates);
        const paragens = coordinates.map(coord => [coord.latitude, coord.longitude]);

        const busStopIcon = L.icon({
          iconUrl: busStopPng,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32],
        });

        paragens.forEach((coords, index) => {
          const stopName = coordinates[index].StopName; // Nome da paragem
          const [stopLat, stopLon] = coords; // Garantir que as coordenadas são extraídas corretamente

          const marker = L.marker([stopLat, stopLon], { icon: busStopIcon }).addTo(this.map);

          marker.on("click", async () => {
            try {
              // Obter a localização do utilizador e autocarro ao clicar no icon
              navigator.geolocation.getCurrentPosition(
                async (position) => {
                  const latestLocation = await locationService.getLatestLocation(this.RouteId);

                  // Extrair latitude e longitude da resposta
                  const driverLat = parseFloat(latestLocation.latitude);
                  const driverLon = parseFloat(latestLocation.longitude);

                  const userLat = position.coords.latitude;
                  const userLon = position.coords.longitude;

                  // Chamada assíncrona para obter a localização do motorista
                  console.log(driverLat, driverLon)
                  console.log(locationService.getLatestLocation(this.RouteId));
                  // Calcular a distância com as coordenadas específicas do marcador
                  const distanceUser = this.calculateDistance(userLat, userLon, stopLat, stopLon);
                  const distanceDriver = this.calculateDistance(driverLat, driverLon, stopLat, stopLon);

                  console.log(`Distância user calculada para ${stopName}: ${distanceUser} metros`);
                  console.log(`Distância driver calculada para ${stopName}: ${distanceDriver} metros`);

                  const formattedUserDistance = this.formatDistance(distanceUser);
                  const formattedDriverDistance = this.formatDistance(distanceDriver);

                  const popupContent = `
                    <div>
                      <strong>${stopName}</strong><br/>
                      Distância de ti: ${formattedUserDistance}<br/>
                      Distância do autocarro: ${formattedDriverDistance}
                    </div>
                  `;
                  marker.bindPopup(popupContent).openPopup();
                },
                (error) => {
                  console.error("Erro ao obter localização do utilizador:", error);
                  alert("Erro ao obter a localização do utilizador.");
                }
              );
            } catch (error) {
              console.error("Erro no clique do marcador:", error);
            }
          });
        });

        const routeUrl = `https://router.project-osrm.org/route/v1/driving/${paragens
          .map(p => p.reverse().join(","))
          .join(";")}?overview=full&geometries=geojson`;

        fetch(routeUrl)
          .then(response => response.json())
          .then(data => {
            const route = data.routes[0].geometry;
            L.geoJSON(route, {
              style: {
                color: "blue",
                weight: 5,
                opacity: 0.7,
              },
            }).addTo(this.map);
          })
          .catch(error => {
            console.error("Erro ao obter a rota:", error);
          });
      } catch (error) {
        console.error("Erro ao desenhar a rota:", error);
      }
    },

    // Carrega as paragens de autocarros no mapa
    // async fetchBusStops() {
    //   try {
    //     const response = await fetch(
    //   'https://overpass-api.de/api/interpreter?data=[out:json];node["highway"="bus_stop"](41.2366,-8.5632,41.3807,-8.3447);out;'
    // );
    //     const data = await response.json();

    //     const busStopIcon = new L.Icon({
    //       iconUrl: busStopPng,
    //       iconSize: [20, 20],
    //       iconAnchor: [10, 10],
    //       popupAnchor: [0, -10],
    //     });

    //     data.elements.forEach((busStop) => {
    //       const marker = L.marker([busStop.lat, busStop.lon], { icon: busStopIcon })
    //         .bindPopup(`Paragem: ${busStop.tags.name || "Sem Nome"}`)
    //         .addTo(this.busStopsLayer);

    //       this.markers.push(marker);
    //     });

    //     console.log("Paragens de autocarros adicionadas ao mapa.");
    //   } catch (err) {
    //     console.error("Erro ao buscar paragens de autocarro:", err);
    //   }
    // },

    // // Controla as paragens de autocarros baseadas no nível de zoom
    // checkZoomLevel() {
    //   if (this.map.getZoom() >= 15) {
    //     if (!this.map.hasLayer(this.busStopsLayer)) {
    //       this.map.addLayer(this.busStopsLayer);
    //     }
    //   } else {
    //     if (this.map.hasLayer(this.busStopsLayer)) {
    //       this.map.removeLayer(this.busStopsLayer);
    //     }
    //   }
    // },
    // Atualiza a localização do autocarro
    async fetchLatestLocation() {
      try {
        const { latitude, longitude } = await locationService.getLatestLocation(this.RouteId);

        const busIcon = new L.Icon({
          iconUrl: busIconPng,
          iconSize: [54, 54],
          iconAnchor: [16, 32],
        });

        // Se o marcador do ônibus já existir, reposicione-o
        if (this.busMarker) {
          this.busMarker.setLatLng([latitude, longitude]); // Atualiza a posição
        } else {
          // Caso contrário, cria um novo marcador
          this.busMarker = L.marker([latitude, longitude], { icon: busIcon }).addTo(this.map);
        }

        // Adiciona um evento de clique no marcador do autocarro
        this.busMarker.on("click", () => {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const userLat = position.coords.latitude;
              const userLon = position.coords.longitude;

              // Calcula a distância entre a localização do usuário e a do autocarro
              const distance = this.calculateDistance(userLat, userLon, latitude, longitude);
              
              // Formata a distância
              const formattedDistance = await this.formatDistance(distance); // Convertendo para km, pois o cálculo de distância pode retornar em metros

              const popupContent = `
                <div>
                  <strong>Autocarro</strong><br/>
                  Distância: ${formattedDistance}
                </div>
              `;
              
              // Exibe o popup com a distância calculada
              this.busMarker.bindPopup(popupContent).openPopup();
            },
            (error) => {
              console.error("Erro ao obter localização do utilizador:", error);
              alert("Erro ao obter a localização do utilizador.");
            }
          );
        });
      } catch (err) {
        console.error("Erro ao buscar localização do autocarro:", err);
      }
    },

    // Localiza o utilizador
    async getUserLocation() {
      try {
        navigator.geolocation.watchPosition(
          (position) => {
            const { latitude, longitude } = position.coords;

            const userIcon = new L.Icon({
              iconUrl: userLocationPng,
              iconSize: [32, 32],
              iconAnchor: [16, 32],
              popupAnchor: [0, -32],
            });

            // Se o marcador do usuário já existir, reposicione-o
            if (this.userLocationMarker) {
              this.userLocationMarker.setLatLng([latitude, longitude]); // Atualiza a posição
            } else {
              // Caso contrário, cria um novo marcador
              this.userLocationMarker = L.marker([latitude, longitude], { icon: userIcon })
                .bindPopup("Tou aqui rei :)")
                .addTo(this.map);
            }
          },
          (error) => {
            console.error("Erro ao obter localização do utilizador:", error);
            alert("Não foi possível obter a localização.", error);
          },
          {
            enableHighAccuracy: true,
            timeout: 70000,
            maximumAge: 0,
          }
        );
      } catch (err) {
        console.error("Erro ao buscar localização do utilizador:", err);
      }
    },

    // Voltar à página anterior
    goBack() {
      this.$router.push("/index");
    },

    // Centraliza o mapa na localização do autocarro
    async goToTheBus() {
      try {
        const { latitude, longitude } = await locationService.getLatestLocation(this.RouteId);
        this.map.setView([latitude, longitude], 15);
      } catch (err) {
        console.error("Erro ao centralizar no autocarro:", err);
      }
    },

    // Centraliza o mapa na localização do utilizador
    goToUserLocation() {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          this.map.setView([latitude, longitude], 15);
        },
        (err) => {
          console.error("Erro ao centralizar no utilizador:", err);
        }
      );
    },
  },
};
</script>

<style scoped>
html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden; /* Remove barras de rolagem */
  background-color: black; /* Ajuste para evitar cores visíveis */
}
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.map-container {
  width: 100vw;
  height: 100vh;
  position: relative;
}

#map {
  width: 100%;
  height: calc(100% - 100px); /* Deixa espaço para o menu */
}

.menu-container {
  width: 100%;
  height: 100px; /* Altura do menu */
  background-color: black;
  position: absolute;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.button-container {
  display: flex;
  gap: 30px; /* Espaço entre os botões */
}

.circle-button {
  width: 70px;
  height: 70px;
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 26px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: background 0.3s ease, transform 0.2s;
}

.circle-button:hover {
  background-color: rgba(255, 255, 255, 0.3);
}

.circle-button:active {
  transform: scale(0.9);
}

.circle-button i {
  font-size: 28px;
}

</style>