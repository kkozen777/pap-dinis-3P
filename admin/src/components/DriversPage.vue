<template>
  <div class="container">
    <h1>Drivers List</h1>
    <div v-if="loading" class="loading">Loading...</div>
    <div v-else>
      <table class="drivers-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Driver Number</th>
            <th>Password</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(driver) in drivers" :key="driver.id">
            <td>{{ driver.id }}</td>
            <td>{{ driver.name }}</td>
            <td>{{ driver.driverNumber }}</td>
            <td>{{ driver.password }}</td>
            <td class="actions">
              <button class="edit-btn" @click="openModal('edit', driver)">Edit</button>
              <button class="delete-btn" @click="deleteDriver(driver.id)">Delete</button>
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colspan="5" style="text-align: center;">
              <button class="add-btn" @click="openModal('create')">Create Driver</button>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal-content">
        <h2>{{ modalType === 'edit' ? 'Edit Driver' : 'Create Driver' }}</h2>
        <form @submit.prevent="modalType === 'create' ? createDriver() : editDriver()" class="driver-form">
          <div class="form-group">
            <label>Name:</label>
            <input v-model="modalDriver.name" type="text" required />
          </div>
          <div class="form-group">
            <label>Driver number:</label>
            <input v-model="modalDriver.driverNumber" type="number" required />
          </div>
          <div class="form-group">
            <label>Password:</label>
            <input v-model="modalDriver.password" type="text" />
          </div>
          <div class="modal-actions">
            <button type="submit" class="save-btn">{{ modalType === 'edit' ? 'Save' : 'Create Driver' }}</button>
            <button type="button" class="cancel-btn" @click="closeModal">Cancel</button>
          </div>
        </form>

      </div>
    </div>
  </div>
</template>

<script>
import driverService from "@/services/driverService";

export default {
  data() {
    return {
      drivers: [],
      loading: true,
      showModal: false,
      modalType: '',
      modalDriver: {
        id: null,
        name: '',
        driverNumber: '',
        password: '',
      },
    };
  },
  methods: {
    async fetchDrivers() {
      try {
        const response = await driverService.getDrivers();
        this.drivers = response.data.drivers;

        // remover a pass para nao mostrar a pass dos drivers
        this.drivers.forEach(driver => {
          delete driver.password;
        });
      } catch (error) {
        console.error("Error getting drivers:", error);
      } finally {
        this.loading = false;
      }
    },
    openModal(type, driver = null) {
      this.modalType = type;
      if (type === 'edit' && driver) {
        this.modalDriver = { ...driver };
        this.modalDriver.password = ''; // campo de password vazio para edição
      } else {
        this.modalDriver = { id: null, name: '', driverNumber: '', password: '' };
      }
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
    },
    async createDriver() {
      try {
        const driverData = { ...this.modalDriver };
        delete driverData.id;

        // se a password estiver vazia, não enviarao backend
        if (
          !driverData.password) {
          delete driverData.password;
        }

        const response = await driverService.createDriver(driverData);
        this.drivers.push(response.data.driver); // ao criar, adiciona este driver a lista de drivers

        this.closeModal();
      } catch (error) {
        console.error("Error getting drivers:", error.response?.data || error);
      }
    },
    async editDriver() {
      try {
        const driverData = { ...this.modalDriver };

        delete driverData.id;
        delete driverData.createdAt;
        delete driverData.updatedAt;
        if(!driverData.password){
          delete driverData.password;
        }
        const response = await driverService.updateDriver(this.modalDriver.id, driverData);
        if (response.data && response.data.updateDriver) {
          this.drivers = this.drivers.map(driver =>
          driver.id === this.modaldriver.id ? response.data.updateDriver : driver
          );
        } else {
          console.error("Error updating", response.data);
        }
        await this.fetchDrivers();
        this.closeModal();
      } catch (error) {
        console.error("Error updating driver", error.response?.data || error);
      }
    },
    async deleteDriver(driverId) {
      const confirmDelete = confirm("Are you sure that you want to delete this driver?");
      if (confirmDelete) {
        try {
          await driverService.deleteDriver(driverId);
          this.drivers = this.drivers.filter(driver => driver.id !== driverId);
        } catch (error) {
          console.error("Error deleting driver:", error);
        }
      }
    },
  },
  mounted() {
    this.fetchDrivers();
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

.drivers-table {
  width: 100%;
  border-collapse: collapse;
  margin: 0 auto;
}

.drivers-table th, .drivers-table td {
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

.modal-overlay {
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  overflow: hidden; /* Impede o modal de sair da tela */
}


.modal-content {
  background: rgb(0, 0, 0);
  padding: 20px;
  border-radius: 10px;
  width: 400px;
  overflow-y: auto; /* Adiciona rolagem vertical */
  max-height: calc(100vh - 40px); /* Limita a altura ao tamanho da janela, com margem */
  overflow-y: auto; /* Adiciona rolagem vertical quando necessário */
  flex-direction: column; /* Para separar o conteúdo do rodapé */

  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.driver-form {
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

input {
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
