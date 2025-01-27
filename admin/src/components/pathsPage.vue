<template>
    <div class="container">
      <h1>Gestão de Paths</h1>
      <div v-if="loading" class="loading">Loading...</div>
      <div v-else>
        <table class="paths-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(path, index) in paths" :key="index">
              <td>{{ path.name }}</td>
              <td class="actions">
                <button class="edit-btn" @click="openModal('edit', path)">Editar</button>
                <button class="delete-btn" @click="deletePath(index)">Apagar</button>
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="text-align: center;">
                <button class="add-btn" @click="openModal('create')">Adicionar Path</button>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
  
      <!-- Modal para Adicionar/Editar Path -->
      <div v-if="showModal" class="modal-overlay">
        <div class="modal-content">
          <h2>{{ modalType === 'edit' ? 'Editar Path' : 'Adicionar Path' }}</h2>
          <div class="form-group">
      <label for="path-name">Nome do Path:</label>
      <input
        id="path-name"
        type="text"
        v-model="modalPath.name"
        placeholder="Insira o nome do path"
        required
      />
    </div>
          <div id="map" class="map-container"></div>
  
          <!-- Lista de coordenadas adicionadas -->
          <ul class="coordinates-list" style="max-height: 300px; overflow-y: auto;">
            <li v-for="(coord, index) in modalPath.coordinates" :key="index">
                {{ coord.latitude }}, {{ coord.longitude }} - {{ coord.StopName }}
                <button class="remove-btn" @click="removeCoordinate(index)">Remover</button>
            </li>
        </ul>

  
          <div class="modal-actions">
            <button @click="savePath" class="save-btn">Salvar Path</button>
            <button @click="closeModal" class="cancel-btn">Cancelar</button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import L from "leaflet";
  import "leaflet/dist/leaflet.css";
  import pathsService from "@/services/pathService";
  import busStopPng from "@/assets/busStop.png"
  export default {
    data() {
      return {
        paths: [],
        loading: true,
        showModal: false,
        modalType: '',
        modalPath: {
          name: '',
          coordinates: [],
        },
        map: null,
        markerLayer: null,
        routeLayer: null,
      };
    },
    methods: {
        async fetchPaths() {
            try {
                const response = await pathsService.getPaths();
                console.log("Resposta da API:", response.data); // Verifique o que está sendo retornado

                if (!response.data) {
                throw new Error("Resposta inválida do servidor");
                }

                // Ajustar para lidar com o campo 'coordinates' como uma string JSON
                this.paths = response.data.map(path => ({
                ...path,
                // Verifica se as coordenadas são uma string e faz o parse
                coordinates: path.coordinates ? JSON.parse(path.coordinates) : []
                }));

            } catch (error) {
                console.error("Erro ao buscar paths:", error);
            } finally {
                this.loading = false;
            }
        },

        openModal(type, path = null) {
            this.modalType = type;
            this.modalPath = path ? { ...path, coordinates: [...path.coordinates] } : { name: '', coordinates: [] };
            this.showModal = true;
            this.$nextTick(() => {
                this.initMap();
                this.drawRoute(); // Desenha a rota ao abrir o modal para edição
            });
        },
        closeModal() {
            this.showModal = false;

            // Remove as camadas de marcadores e rota
            if (this.markerLayer) {
                this.markerLayer.clearLayers();
                this.map.removeLayer(this.markerLayer);
                this.markerLayer = null;
            }
            if (this.routeLayer) {
                this.routeLayer.clearLayers();
                this.map.removeLayer(this.routeLayer);
                this.routeLayer = null;
            }

            // Remove eventos e destrói o mapa
            if (this.map) {
                this.map.off();
                this.map.remove();
                this.map = null;
            }
        },

        initMap() { 
    this.$nextTick(() => {
        // Inicializa o mapa
        this.map = L.map("map").setView([41.3380766, -8.478313], 14);

        // Adiciona a camada de tiles (mapa de fundo)
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(this.map);

        // Cria as camadas de marcadores e rota
        this.markerLayer = L.layerGroup().addTo(this.map);
        this.routeLayer = L.layerGroup().addTo(this.map); 

        // Adiciona os marcadores, mas sem a exibição de latitude e longitude
        const busStopIcon = L.icon({
            iconUrl: busStopPng,
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32]
        });

        // Se houver coordenadas, adiciona os marcadores no mapa com o nome do ponto
        if (this.modalPath.coordinates.length) {
            const coordinates = this.modalPath.coordinates.map(coord => [coord.latitude, coord.longitude]);
            coordinates.forEach(coord => {
                const marker = L.marker(coord, { icon: busStopIcon }).addTo(this.markerLayer);
                // Exibe apenas o StopName no popup
                const stopName = this.modalPath.coordinates.find(c => c.latitude === coord[0] && c.longitude === coord[1]).StopName;
                marker.bindPopup(`${stopName}`);
            });

            // Ajusta os limites do mapa para mostrar todos os pontos
            const bounds = L.latLngBounds(coordinates);
            this.map.fitBounds(bounds);
        }

        // Adiciona eventos de zoom e clique
        this.map.on('zoomend', () => {
            if (this.markerLayer) {
                this.markerLayer.eachLayer(marker => marker.update());
            }
        });

        // Configura o evento de clique no mapa para adicionar coordenadas
        this.map.on("click", this.handleMapClick);
        
        // Desenha a rota, caso existam pontos
        this.drawRoute(); 
    });
},

        handleMapClick(e) {
            const latitude = e.latlng.lat;
            const longitude = e.latlng.lng;
            const stopName = prompt("Nome do ponto:");

            if (!stopName) return;

            const newPoint = { latitude, longitude, StopName: stopName };
            this.modalPath.coordinates.push(newPoint);

            // Garante que a camada existe antes de adicionar o marcador
            if (!this.markerLayer) {
                this.markerLayer = L.layerGroup().addTo(this.map);
            }

            // Criando o ícone do ponto de ônibus
            const busStopIcon = L.icon({
                iconUrl: busStopPng,
                iconSize: [32, 32],
                iconAnchor: [16, 32],
                popupAnchor: [0, -32]
            });

            // Adicione os marcadores ao markerLayer em vez de diretamente ao mapa
            const marker = L.marker([latitude, longitude], { icon: busStopIcon });
            this.markerLayer.addLayer(marker); // Use a camada em vez do mapa
            
            // Exibe apenas o nome do ponto de parada no popup
            marker.bindPopup(`${stopName}`);

            // Mantém referência do marcador na camada para evitar perda ao dar zoom
            this.map.addLayer(this.markerLayer);

            this.drawRoute();
        },

        drawRoute() {
            if (this.modalPath.coordinates.length < 2) return;

            if (!this.routeLayer) {
                this.routeLayer = L.layerGroup().addTo(this.map);
            } else {
                this.routeLayer.clearLayers();
            }

            const routeCoordinates = this.modalPath.coordinates.map(coord => `${coord.longitude},${coord.latitude}`);

            const routeUrl = `https://router.project-osrm.org/route/v1/driving/${routeCoordinates.join(';')}?overview=full&geometries=geojson`;

            fetch(routeUrl)
                .then(response => response.json())
                .then(data => {
                    if (data.routes && data.routes.length > 0) {
                        const route = data.routes[0].geometry;

                        L.geoJSON(route, {
                            style: { color: "blue", weight: 5, opacity: 0.7 }
                        }).addTo(this.routeLayer);
                    }
                })
                .catch(error => console.error("Erro ao obter a rota:", error));
        },

        removeCoordinate(index) {
            const removedPoint = this.modalPath.coordinates.splice(index, 1)[0];

            if (!this.markerLayer) return;

            // Remove apenas o marcador específico, sem limpar tudo
            this.markerLayer.eachLayer(layer => {
                if (layer.getLatLng().lat === removedPoint.latitude && layer.getLatLng().lng === removedPoint.longitude) {
                    this.markerLayer.removeLayer(layer);
                }
            });

            this.drawRoute();
        },

      async deletePath(index) {
        if (confirm("Tem certeza de que deseja apagar este path?")) {
          try {
            await pathsService.deletePath(this.paths[index].id);
            this.paths.splice(index, 1);
          } catch (error) {
            console.error("Erro ao apagar path:", error);
          }
        }
      },
      
      async savePath() {
        try {
            if (!this.modalPath.name.trim()) {
            alert("Put the Path Name");
            return;
            }

            if (this.modalType === "create") {
            console.log(this.modalPath)
            const response = await pathsService.createPath(this.modalPath);
            console.log(response)
            this.paths.push(response.data.path);
            // this.paths.push({
            //     ...response.data,
            //     coordinates: JSON.parse(response.data.coordinates || '[]'),
            // });
            } else {
            await pathsService.updatePath(this.modalPath.id, this.modalPath);
            await this.fetchPaths();
            }

            this.closeModal();
        } catch (error) {
            console.error("Erro ao salvar path:", error);
        }
        },
    },
    mounted() {
      this.fetchPaths();
    },
  };
  </script>
  
  <style scoped>
  .container {
    padding: 20px;
  }
  
  #map {
    height: 400px;
    width: 100%;
    margin-bottom: 20px;
  }
  
  .coordinates-list {
    list-style: none;
    padding: 0;
  }
  
  .coordinates-list li {
    background: #000000;
    padding: 5px;
    margin: 5px 0;
  }
  
  .paths-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
  }
  
  .paths-table th, .paths-table td {
    border: 1px solid #ddd;
    padding: 10px;
    text-align: left;
  }
  
  .actions {
    display: flex;
    gap: 10px;
  }
  
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .modal-content {
    background: black;
    padding: 20px;
    border-radius: 5px;
    width: 60%;
    
    height: 100%;
    overflow: auto;

  }
  
  .modal-actions {
    display: flex;
    justify-content: space-between;
    margin-top: 10px;
  }
  /* Botão Editar (verde) */
.edit-btn {
  background-color: #28a745; /* Verde */
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.edit-btn:hover {
  background-color: #218838; /* Verde mais escuro no hover */
}

/* Botão Apagar (vermelho) */
.delete-btn {
  background-color: #dc3545; /* Vermelho */
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.delete-btn:hover {
  background-color: #c82333; /* Vermelho mais escuro no hover */
}

/* Botão Adicionar (azul) */
.add-btn {
  background-color: #007bff; /* Azul */
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.add-btn:hover {
  background-color: #0056b3; /* Azul mais escuro no hover */
}
.remove-btn {
  background-color: #dc3545; /* Vermelho */
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.remove-btn:hover {
  background-color: #c82333; /* Vermelho mais escuro no hover */
}/* Botão Salvar (verde) */
.save-btn {
  background-color: #28a745; /* Verde */
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.save-btn:hover {
  background-color: #218838; /* Verde mais escuro no hover */
}

/* Botão Cancelar (vermelho) */
.cancel-btn {
  background-color: #dc3545; /* Vermelho */
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.cancel-btn:hover {
  background-color: #c82333; /* Vermelho mais escuro no hover */
}
  </style>
  