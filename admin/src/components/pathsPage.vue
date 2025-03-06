<template>
  <div class="container">
    <h1>Paths List</h1>
    <!-- Mostra a mensagem de loading enquanto os dados estão a ser carregados -->
    <div v-if="loading" class="loading">Loading...</div>
    <div v-else>
      <table class="paths-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <!-- ve a lista de paths e cria uma linha para cada um -->
          <tr v-for="(path, index) in paths" :key="index">
            <td>{{ path.name }}</td>
            <td class="actions">
              <!-- Botão para editar um path -->
              <button class="edit-btn" @click="openModal('edit', path)">Edit</button>
              <!-- Botão para apagar um path -->
              <button class="delete-btn" @click="deletePath(index)">Delete</button>
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="text-align: center;">
              <!-- Botão para criar um novo path -->
              <button class="add-btn" @click="openModal('create')">Create Path</button>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- Modal para criar ou editar um path -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal-content">
        <h2>{{ modalType === 'edit' ? 'Edit Path' : 'Create Path' }}</h2>
        <div class="form-group">
    <label for="path-name">Path's name:</label>
    <input
      id="path-name"
      type="text"
      v-model="modalPath.name"
      placeholder="Insert the path"
      required
    />
  </div>
        <!-- Div onde o mapa será carregado -->
        <div id="map" class="map-container"></div>

        <!-- Lista de coordenadas associadas ao path -->
        <ul class="coordinates-list" style="max-height: 300px; overflow-y: auto;">
          <li v-for="(coord, index) in modalPath.coordinates" :key="index">
              {{ coord.latitude }}, {{ coord.longitude }} - {{ coord.StopName }}
              <button class="remove-btn" @click="removeCoordinate(index)">Remove</button>
          </li>
      </ul>

        <!-- Ações do modal -->
        <div class="modal-actions">
          <button @click="savePath" class="save-btn">Save Path</button>
          <button @click="closeModal" class="cancel-btn">Cancel</button>
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
        paths: [], // Lista de paths
        loading: true, // Estado de carregamento
        showModal: false, // Controla a exibição do modal
        modalType: '', // Tipo do modal (create/edit) //
        modalPath: {
          name: '',
          coordinates: [],
        },
        map: null, // Instância do mapa Leaflet
        markerLayer: null, // Camada de marcadores no mapa
        routeLayer: null, // Camada da rota no mapa
      };
    },
    methods: {
        async fetchPaths() {
            try {
              //guarda todos os caminhos
                const response = await pathsService.getPaths();

                if (!response.data) {
                throw new Error("Invalid awnser");
                }

                // para colocar as coordenadas como um JSON
                this.paths = response.data.map(path => ({
                ...path,
                coordinates: path.coordinates ? JSON.parse(path.coordinates) : []
                }));

            } catch (error) {
                console.error("Error getting paths:", error);
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
                this.drawRoute(); // Desenha a rota ao abrir o modal para edição, porque já existem coordenadas daquele path
            });
        },
        closeModal() {
            this.showModal = false;

            // faz um reset ao mapa, porque so da para ter um mapa de cada vez por component entao, ao fechar apaga o mapa
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

            if (this.map) {
                this.map.off();
                this.map.remove();
                this.map = null;
            }
        },

        initMap() { 
          this.$nextTick(() => {
              // inicializa o mapa
              this.map = L.map("map").setView([41.3380766, -8.478313], 14);
              L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(this.map);

              // cria as camadas de marcadores e rota
              this.markerLayer = L.layerGroup().addTo(this.map);
              this.routeLayer = L.layerGroup().addTo(this.map); 

              // cria um icon 
              const busStopIcon = L.icon({
                  iconUrl: busStopPng,
                  iconSize: [32, 32],
                  iconAnchor: [16, 32],
                  popupAnchor: [0, -32]
              });
              // caso o mapa ja tenha coordenadas ao ser aberto vao ser colocadas la
              if (this.modalPath.coordinates.length) {
                  const coordinates = this.modalPath.coordinates.map(coord => [coord.latitude, coord.longitude]);
                  coordinates.forEach(coord => {
                      const marker = L.marker(coord, { icon: busStopIcon }).addTo(this.markerLayer);
                      // exibe apenas o StopName no popup
                      const stopName = this.modalPath.coordinates.find(c => c.latitude === coord[0] && c.longitude === coord[1]).StopName;
                      marker.bindPopup(`${stopName}`);
                  });
                  // ajusta os limites do mapa para mostrar todos os pontos
                  const bounds = L.latLngBounds(coordinates);
                  this.map.fitBounds(bounds);
              }
              // adiciona os eventos para conseguir dar zoom e clicar
              this.map.on('zoomend', () => {
                  if (this.markerLayer) {
                      this.markerLayer.eachLayer(marker => marker.update());
                  }
              });
              // aqui chama a funcao que faz para que o evento de clique no mapa seja para colocar novas coordenadas
              this.map.on("click", this.handleMapClick);
              
              // desenha a rota, caso existam pontos
              this.drawRoute(); 
          });
        },

        handleMapClick(e) {
          const latitude = e.latlng.lat;
          const longitude = e.latlng.lng;
          const stopName = prompt("Stop name: "); // mensagem que aparece no pop up ao clicar em uma paragem

          if (!stopName) return;

          const newPoint = { latitude, longitude, StopName: stopName };
          this.modalPath.coordinates.push(newPoint);

          // garante que a camada existe antes de adicionar o marcador, correção de erro
          if (!this.markerLayer) {
              this.markerLayer = L.layerGroup().addTo(this.map);
          }

          // cria o icon
          const busStopIcon = L.icon({
              iconUrl: busStopPng,
              iconSize: [32, 32],
              iconAnchor: [16, 32],
              popupAnchor: [0, -32]
          });

          // adiciona  os marcadores ao markerLayer em vez de diretamente ao mapa, correcao de erros
          const marker = L.marker([latitude, longitude], { icon: busStopIcon });
          this.markerLayer.addLayer(marker); // use a camada em vez do mapa
          
          // exibe apenas o nome da paragem no popup
          marker.bindPopup(`${stopName}`);

          // mentem o marcador na camada par nao haver bugs ao dar zoom
          this.map.addLayer(this.markerLayer);

          this.drawRoute();
        },

        drawRoute() {
            // Só desenha a rota se houver pelo menos dois pontos
            if (this.modalPath.coordinates.length < 2) return;

            if (!this.routeLayer) {
                this.routeLayer = L.layerGroup().addTo(this.map);
            } else {
                this.routeLayer.clearLayers();
            }

            // Converte as coordenadas para o formato necessário
            const routeCoordinates = this.modalPath.coordinates.map(coord => `${coord.longitude},${coord.latitude}`);

            // URL da API externa do OSRM para calcular o trajeto entre os pontos
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
                .catch(error => console.error("Error getting route:", error));
        },

        removeCoordinate(index) {
            const removedPoint = this.modalPath.coordinates.splice(index, 1)[0];

            if (!this.markerLayer) return;

            //caso user queira remover uma paragem
            this.markerLayer.eachLayer(layer => {
                if (layer.getLatLng().lat === removedPoint.latitude && layer.getLatLng().lng === removedPoint.longitude) {
                    this.markerLayer.removeLayer(layer);
                }
            });
            //desenha a rota mas sem a paragem removida
            this.drawRoute();
        },

      async deletePath(index) {
        //caso o utilizador confirme o aviso enviado
        if (confirm("Are you sure that you want to remove this path?")) {
          try {
            //chama o service e envia o id do path selecionado no index
            await pathsService.deletePath(this.paths[index].id);
            this.paths.splice(index, 1);
          } catch (error) {
            console.error("Error deleting path:", error);
          }
        }
      },
      
      async savePath() {
        try {
            // Verifica se o nome do caminho foi preenchido
            if (!this.modalPath.name.trim()) {
              alert("Put the Path Name");
              return;
            }
            // Se for um novo caminho, cria um novo registro
            if (this.modalType === "create") {
              const response = await pathsService.createPath(this.modalPath);
              this.paths.push(response.data.path); // Adiciona o novo caminho à lista
            } else {
              // Caso contrário, atualiza um caminho existente
              await pathsService.updatePath(this.modalPath.id, this.modalPath);
              await this.fetchPaths(); // Atualiza a lista de caminhos após a edição
            }

            // Fecha o modal após salvar as alterações
            this.closeModal();
        } catch (error) {
            console.error("Error saving path:", error);
        }
      },
    },
    //ao abrir, recebe os paths todos
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
  