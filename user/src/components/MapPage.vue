<template>
  <div>
    <button @click="goBack">Go Back</button>
    <button @click="goToTheBus">Where is the bus?</button>
    <button @click="goToUserLocation">Onde é que eu tou?</button>
    <div id="map" ref="map"></div>
  </div>
</template>

<script>
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import locationService from "@/services/locationsService";
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

      setInterval(async () => {
        await this.fetchLatestLocation();
        await this.getUserLocation();
      }, 10000); // Atualiza a localização a cada 10 segundos
    } catch (error) {
      console.error("Erro ao montar o componente:", error);
    }
  },
  beforeUnmount() {
    if (this.map) {
      this.map.off();
      this.map.remove();
      this.map = null;
    }
  },
  methods: {
    // Inicialização do mapa
    initializeMap() {
      this.map = L.map(this.$refs.map, {
        zoomControl: false,
        zoom: 14,
      }).setView([37.784173, -122.401557], 14);

      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        {
          attribution: "Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ",
          maxZoom: 19,
          minZoom: 7,
        }
      ).addTo(this.map);

      this.busStopsLayer.addTo(this.map);
      this.map.on("zoomend", this.checkZoomLevel); // Verifica o nível de zoom
    },

    // Carrega os dados iniciais
    async loadInitialData() {
      await this.fetchBusStops();
      await this.fetchLatestLocation();
      await this.getUserLocation();
      await this.goToTheBus();
    },

    // Carrega as paragens de autocarros no mapa
    async fetchBusStops() {
      try {
        const response = await fetch(
      'https://overpass-api.de/api/interpreter?data=[out:json];node["highway"="bus_stop"](41.2366,-8.5632,41.3807,-8.3447);out;'
    );
        const data = await response.json();

        const busStopIcon = new L.Icon({
          iconUrl: busStopPng,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
          popupAnchor: [0, -10],
        });

        data.elements.forEach((busStop) => {
          const marker = L.marker([busStop.lat, busStop.lon], { icon: busStopIcon })
            .bindPopup(`Paragem: ${busStop.tags.name || "Sem Nome"}`)
            .addTo(this.busStopsLayer);

          this.markers.push(marker);
        });

        console.log("Paragens de autocarros adicionadas ao mapa.");
      } catch (err) {
        console.error("Erro ao buscar paragens de autocarro:", err);
      }
    },

    // Controla as paragens de autocarros baseadas no nível de zoom
    checkZoomLevel() {
      if (this.map.getZoom() >= 13) {
        if (!this.map.hasLayer(this.busStopsLayer)) {
          this.map.addLayer(this.busStopsLayer);
        }
      } else {
        if (this.map.hasLayer(this.busStopsLayer)) {
          this.map.removeLayer(this.busStopsLayer);
        }
      }
    },

    // Atualiza a localização do autocarro
    async fetchLatestLocation() {
      try {
        const { latitude, longitude } = await locationService.getLatestLocation(this.RouteId);

        const busIcon = new L.Icon({
          iconUrl: busIconPng,
          iconSize: [54, 54],
          iconAnchor: [16, 32],
        });

        if (this.busMarker) this.map.removeLayer(this.busMarker);

        this.busMarker = L.marker([latitude, longitude], { icon: busIcon }).addTo(this.map);
      } catch (err) {
        console.error("Erro ao buscar localização do autocarro:", err);
      }
    },

    // Localiza o utilizador
    async getUserLocation() {
      try {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;

            const userIcon = new L.Icon({
              iconUrl: userLocationPng,
              iconSize: [32, 32],
              iconAnchor: [16, 32],
              popupAnchor: [0, -32],
            });

            if (this.userLocationMarker) this.map.removeLayer(this.userLocationMarker);

            this.userLocationMarker = L.marker([latitude, longitude], { icon: userIcon })
              .bindPopup("Tou aqui rei :)")
              .addTo(this.map);
          },
          (error) => {
            console.error("Erro ao obter localização do utilizador:", error);
            alert("Não foi possível obter a localização.");
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
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
body {
  margin: 0;
  font-family: Arial, sans-serif;
  background-color: #121212;
  color: #e0e0e0;
}

#map {
  width: 100%;
  height: 80vh;
  margin: 20px auto;
  border: 2px solid #1e1e1e;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
}

button {
  display: block;
  margin: 10px auto 0;
  padding: 10px 20px;
  font-size: 1rem;
  background-color: #6200ea;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
}

button:hover {
  background-color: #3700b3;
}

button:active {
  background-color: #4b00c1;
}

button:focus {
  outline: none;
  box-shadow: 0 0 4px #ffffff;
}
</style>
