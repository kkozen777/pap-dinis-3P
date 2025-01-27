<template>
  <div class="container">
    <h1>Lista de Motoristas</h1>
    <div v-if="loading" class="loading">Loading...</div>
    <div v-else>
      <table class="drivers-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Nome</th>
            <th>Número do Motorista</th>
            <th>Password</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(driver, index) in drivers" :key="driver.id">
            <td>{{ index + 1 }}</td>
            <td>{{ driver.name }}</td>
            <td>{{ driver.driverNumber }}</td>
            <td>{{ driver.password }}</td>
            <td class="actions">
              <button class="edit-btn" @click="openModal('edit', driver)">Editar</button>
              <button class="delete-btn" @click="deleteDriver(driver.id)">Eliminar</button>
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colspan="5" style="text-align: center;">
              <button class="add-btn" @click="openModal('create')">Adicionar Motorista</button>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal-content">
        <h2>{{ modalType === 'edit' ? 'Editar Motorista' : 'Adicionar Motorista' }}</h2>
        <form @submit.prevent="modalType === 'create' ? createDriver() : editDriver()" class="driver-form">
          <div class="form-group">
            <label>Nome:</label>
            <input v-model="modalDriver.name" type="text" required />
          </div>
          <div class="form-group">
            <label>Número do Motorista:</label>
            <input v-model="modalDriver.driverNumber" type="number" required />
          </div>
          <div class="form-group">
            <label>Password:</label>
            <input v-model="modalDriver.password" type="text" required />
          </div>
          <div class="modal-actions">
            <button type="submit" class="save-btn">{{ modalType === 'edit' ? 'Salvar Alterações' : 'Criar Motorista' }}</button>
            <button type="button" class="cancel-btn" @click="closeModal">Cancelar</button>
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
        password: '', // Inicialmente vazio
      },
    };
  },
  methods: {
    async fetchDrivers() {
      try {
        const response = await driverService.getDrivers();
        this.drivers = response.data.drivers;

        // Remover a senha para não exibir nos motoristas listados
        this.drivers.forEach(driver => {
          delete driver.password; // Não exibir a senha
        });
      } catch (error) {
        console.error("Erro ao buscar motoristas:", error);
      } finally {
        this.loading = false;
      }
    },
    openModal(type, driver = null) {
      this.modalType = type;
      if (type === 'edit' && driver) {
        // Copiar os dados do motorista, mas com a senha vazia
        this.modalDriver = { ...driver };
        this.modalDriver.password = ''; // Deixar o campo de senha vazio para edição
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

        // Se a senha estiver vazia, não enviar a senha ao backend
        if (!driverData.password) {
          delete driverData.password;
        }

        const response = await driverService.createDriver(driverData);
        this.drivers.push(response.data.driver); // Atualiza a lista de motoristas

        this.closeModal();
      } catch (error) {
        console.error("Erro ao criar motorista:", error.response?.data || error);
      }
    },
    async editDriver() {
      try {
        console.log("Enviando dados para edição:", this.modalDriver);

        // Cria uma cópia dos dados para evitar reatividade indesejada
        const driverData = { ...this.modalDriver };

        // Remover a senha (e outros campos desnecessários) antes de enviar
        delete driverData.id;
        delete driverData.createdAt;
        delete driverData.updatedAt;

        // Se a senha estiver vazia, não enviar ao backend
        if (!driverData.password) {
          delete driverData.password;
        }

        // Atualiza o motorista
        const response = await driverService.updateDriver(this.modalDriver.id, driverData);
        console.log("Resposta da edição do motorista:", response.data);

        if (response.data && response.data.updatedDriver) {
          // Aqui, você remove a senha da resposta antes de atualizar a lista
          const updatedDriver = response.data.updatedDriver;
          delete updatedDriver.password; // Remover a senha da resposta

          this.drivers = this.drivers.map(driver =>
            driver.id === this.modalDriver.id ? updatedDriver : driver
          );
        } else {
          console.error("Dados do motorista atualizados estão ausentes:", response.data);
        }

        this.closeModal();
      } catch (error) {
        console.error("Erro ao editar motorista:", error.response?.data || error);
      }
    },
    async deleteDriver(driverId) {
      const confirmDelete = confirm("Tem certeza de que deseja eliminar este motorista?");
      if (confirmDelete) {
        try {
          await driverService.deleteDriver(driverId);
          this.drivers = this.drivers.filter(driver => driver.id !== driverId);
        } catch (error) {
          console.error("Erro ao eliminar motorista:", error);
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
