<template>
  <div class="container">
    <h1>Line {{ lineId }} routes</h1>
    <div v-if="loading" class="loading">Loading...</div>
    <div v-else>
      <table class="routes-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Path name</th>
            <th>Begans at</th>
            <th>Ends at</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(route) in routes" :key="route.id">
            <td>{{ route.id }}</td>
            <td>{{ route.pathName }}</td>
            <td>{{ route.start_time || 'N/A' }}</td>
            <td>{{ route.end_time || 'N/A' }}</td>
            <td>{{ route.status || 0 }}</td>
            <td class="actions">
              <button class="edit-btn" @click="openModal('edit', route)">Edit</button>
              <button class="delete-btn" @click="deleteRoute(route.id)">Delete</button>
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colspan="6" style="text-align: center;">
              <button class="add-btn" @click="openModal('create')">Create Route</button>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal-content">
        <h2>{{ modalType === 'edit' ? 'Edit Route' : 'Create Route' }}</h2>
        <form @submit.prevent="modalType === 'create' ? createRoute() : editRoute()" class="route-form">
          <div class="form-group">
            <label>Path name:</label>
            <select v-model="modalRoute.pathId" required>
              <option v-for="path in paths" :key="path.id" :value="path.id">
                {{ path.name }}
              </option>
            </select>
            <label>Begans at:</label>
            <input v-model="modalRoute.start_time" type="text" />
            <label>Ends at:</label>
            <input v-model="modalRoute.end_time" type="text" />
            
            <!-- status apenas no modo de edição -->
            <div v-if="modalType === 'edit'">
              <label>Status:</label>
              <input v-model="modalRoute.status" type="text" />
            </div>
          </div>
          <div class="modal-actions">
            <button type="submit" class="create-route-btn">{{ modalType === 'edit' ? 'Save' : 'Create' }}</button>
            <button type="button" class="cancel-btn" @click="closeModal">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import routesService from "@/services/routesService";
import pathService from "@/services/pathService";

export default {
  props: {
    lineId: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      routes: [],
      paths: [],
      loading: true,
      showModal: false,
      modalType: "", 
      modalRoute: {
        id: null,
        lineId: this.lineId,
        pathId: null,
        start_time: "",
        end_time: "",
        status: "",
      },
    };
  },
  methods: {

    async fetchRoutesByLineId() {
      try {
        const response = await routesService.getRoutesByLineId(this.lineId);
        this.routes = response.data.data || [];
        await this.loadPathNames(); // nomes dos paths
      } catch (error) {
        console.error("Error getting routesd:", error);
      } finally {
        this.loading = false;
      }
    },
    // Carrega a lista de paths
    async loadPaths() {
      try {
        const response = await pathService.getPaths();
        this.paths = response.data || []; // Atribui a lista de paths à variável paths
      } catch (error) {
        console.error("Error getting paths:", error);
      }
    },
    // nome do path para cada rota
    async loadPathNames() {
      for (let route of this.routes) {
        try {
          const pathResponse = await pathService.getPathById(route.pathId);
          if (pathResponse && pathResponse.name) {
            route.pathName = pathResponse.name;
          } else {
            route.pathName = "Nome not found"; // se o nome não for encontrado
          }
        } catch (error) {
          console.error("Error getting pathName", error);
          route.pathName = "Error getting name"; // caso de erro
        }
      }
    },
    // Abre o modal para criar ou editar
    openModal(type, route = null) {
      this.modalType = type;
      if (type === "edit" && route) {
        this.modalRoute = { ...route };
      } else {
        this.modalRoute = {
          id: null,
          lineId: this.lineId, // O lineId permanece sempre fixo para a rota 
          pathId: null,
          start_time: "",
          end_time: "",
          status: null,
        };
      }
      this.showModal = true;
    },
    // Fecha o modal
    closeModal() {
      this.showModal = false;
    },
    // Cria uma nova rota
    async createRoute() {
      try {
        const routeData = { ...this.modalRoute };
        delete routeData.id;
        delete routeData.status;
        const response = await routesService.createRoute(routeData);
        if (response.data && response.data.route) {
          const newRoute = response.data.route;
          const pathResponse = await pathService.getPathById(newRoute.pathId);
          if (pathResponse && pathResponse.name) {
            newRoute.pathName = pathResponse.name;
          } else {
            newRoute.pathName = "Name not found";
          }
          this.routes.push(newRoute)

          this.closeModal();
        }
      } catch (error) {
        console.error("Error creating route :", error.response?.data || error);
      }
    },
    // Edita uma rota
    async editRoute() {
      try {
        const routeData = { ...this.modalRoute };
        delete routeData.id;
        delete routeData.pathName;
        delete routeData.createdAt;
        delete routeData.updatedAt;
        delete routeData.Schedule;

        const response = await routesService.updateRoute(this.modalRoute.id, routeData);
        if (response.data && response.data.updatedRoute) {
          this.routes = this.routes.map(route =>
            route.id === this.modalRoute.id ? response.data.updatedRoute : route
          );
          const pathResponse = await pathService.getPathById(response.data.updatedRoute.pathId);
          const updatedRoute = this.routes.find(route => route.id === this.modalRoute.id);
          if (updatedRoute && pathResponse && pathResponse.name) {
            updatedRoute.pathName = pathResponse.name;
          }
          this.closeModal();
        }
      } catch (error) {
        console.error("Error editing route:", error.response?.data || error);
      }
    },
    // Elimina uma rota
    async deleteRoute(routeId) {
      const confirmDelete = confirm("Are you sure that you want to delete this route ?");
      if (confirmDelete) {
        try {
          await routesService.deleteRoute(routeId);
          this.routes = this.routes.filter(route => route.id !== routeId);
        } catch (error) {
          console.error("Error deleting route", error);
        }
      }
    },
  },
  mounted() {
    this.fetchRoutesByLineId(); 
    this.loadPaths(); 
  },
};
</script>


<style scoped>

.container {
  padding: 20px;
}

h1 {
  text-align: center;
  margin-bottom: 20px;
}

.routes-table {
  width: 100%;
  border-collapse: collapse;
  margin: 0 auto;
}

.routes-table th,
.routes-table td {
  padding: 10px;
  text-align: left;
  border: 1px solid #ddd;
}

.actions button {
  margin-right: 5px;
  padding: 5px 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.edit-btn {
  background-color: #4caf50;
  color: white;
}

.delete-btn {
  background-color: #f44336;
  color: white;
}

.add-btn {
  background-color: #2196f3;
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
}

.create-route-btn {
  background-color: #4caf50; /* Verde */
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
}

.cancel-btn {
  background-color: #f44336; /* Vermelho */
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: rgb(0, 0, 0);
  padding: 20px;
  border-radius: 10px;
  width: 400px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

/* Estilos para o dropdown */
select {
  width: 100%;
  padding: 10px;
  margin: 5px 0;
  border-radius: 5px;
  border: 1px solid #ddd;
  background-color: #2c2c2c;  /* Alterado para o fundo desejado */
  color: white;               /* Letras brancas */
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

select:focus {
  outline: none;
  background-color: #1a1a1a; /* Fundo mais escuro no foco */
}

select option {
  padding: 10px;
  background-color: #2c2c2c;  /* Fundo do dropdown */
  color: white;               /* Letras brancas */
  font-size: 16px;
}

select option:hover {
  background-color: #444;  /* Fundo mais claro ao passar o mouse */
}
</style>
