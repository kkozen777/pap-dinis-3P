<template>
  <div class="container">
    <h1>Lines list</h1>
    <div v-if="loading" class="loading">Loading...</div>
    <div v-else>
      <table class="lines-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Schedules</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(line) in lines" :key="line.id">
            <td>{{ line.id }}</td>
            <td>{{ line.name }}</td>
            <td>{{ line.schedules || 'No avaliable schedules' }}</td>
            <td class="actions">
              <button class="edit-btn" @click="openModal('edit', line)">Edit Line</button>
              <button class="edit-route-btn" @click="goToRoutes(line.id)">Edit Line's routes</button>
              <button class="delete-btn" @click="deleteLine(line.id)">Delete Line</button>
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colspan="4" style="text-align: center;">
              <button class="add-btn" @click="openModal('create')">Create Line</button>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal-content">
        <h2>{{ modalType === 'edit' ? 'Edit Line' : 'Create Line' }}</h2>
        <form @submit.prevent="modalType === 'create' ? createLine() : editLine()" class="line-form">
          <div class="form-group">
            <label>Name:</label>
            <input v-model="modalLine.name" type="text" required />
            <label>Schedules:</label>
            <input v-model="modalLine.schedules" type="text" />
          </div>
          <div class="modal-actions">
            <button type="submit" class="save-btn">{{ modalType === 'edit' ? 'Save' : 'Create Line' }}</button>
            <button type="button" class="cancel-btn" @click="closeModal">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import linesService from "@/services/linesService";

export default {
  data() {
    return {
      lines: [],
      loading: true,
      showModal: false, 
      modalType: '', 
      modalLine: {
        id: null,
        name: '',
        schedules: '',
      },
    };
  },
  methods: {
    // pede a api as linhas existentes
    async fetchLines() {
      try {
        const response = await linesService.getLines();
        this.lines = response.data;
      } catch (error) {
        console.error("Error getting lines:", error);
      } finally {
        this.loading = false;
      }
    },
    // abre o modal
    openModal(type, line = null) {
      this.modalType = type;
      if (type === 'edit' && line) {
        this.modalLine = { ...line };
      } else {
        this.modalLine = { name: '', schedules: '' };
      }
      this.showModal = true;
    },
    // fecha o modal
    closeModal() {
      this.showModal = false;
    },
    // cria uma nova linha
    async createLine() {
      try {
        const lineData = { ...this.modalLine };
        delete lineData.id;

        const response = await linesService.createLine(lineData);
        this.lines.push(response.data.line);
        this.closeModal();
      } catch (error) {
        console.error("Error creating driver: ", error.response?.data || error);
      }
    },
    // edita uma linha existente
    async editLine() {
      try {
        const lineData = { ...this.modalLine };

        delete lineData.id;
        delete lineData.status;
        delete lineData.createdAt;
        delete lineData.updatedAt;

        const response = await linesService.updateLine(this.modalLine.id, lineData);
        if (response.data && response.data.updateLine) {
          this.lines = this.lines.map(line =>
            line.id === this.modalLine.id ? response.data.updateLine : line
          );
        } else {
          console.error("Error editing line:", response.data);
        }
        await this.fetchLines();
        this.closeModal();
      } catch (error) {
        console.error("Error editing:", error.response?.data || error);
      }
    },
    // elimina uma linha
    async deleteLine(lineId) {
      const confirmDelete = confirm("Are you sure that you want to delete this line?");
      if (confirmDelete) {
        try {
          await linesService.deleteLine(lineId);
          this.lines = this.lines.filter(line => line.id !== lineId);
        } catch (error) {
          console.error("Error deleting line:", error);
        }
      }
    },
    goToRoutes(LineId) {
      this.$router.push({ 
        name: 'routes', 
        params: { lineId: LineId } 
      });
    }
  },
  mounted() {
    this.fetchLines();
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

.lines-table {
  width: 100%;
  border-collapse: collapse;
  margin: 0 auto;
}

.lines-table th, .lines-table td {
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

.edit-route-btn {
  background-color: #2196f3;
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

.line-form {
  display: flex;
  flex-direction: column;
}

.form-group {
  margin-bottom: 15px;
}

label {
  margin-bottom: 5px;
  font-weight: bold;
  display: block;
}

input, select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.modal-actions {
  display: flex;
  justify-content: space-between;
}

.save-btn {
  background-color: #4caf50;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.cancel-btn {
  background-color: #f44336;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
</style>
