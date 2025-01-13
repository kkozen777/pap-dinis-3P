<template>
  <div class="container">
    <h1>Lista de Linhas</h1>
    <div v-if="loading" class="loading">Carregando...</div>
    <div v-else>
      <table class="lines-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Horários</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(line) in lines" :key="line.id">
            <td>{{ line.id }}</td>
            <td>{{ line.name }}</td>
            <!-- Exibe 'Sem horários disponíveis' caso schedules seja null -->
            <td>{{ line.schedules || 'Sem horários disponíveis' }}</td>
            <td class="actions">
              <button class="edit-btn" @click="openModal('edit', line)">Editar Linha</button>
              <button class="edit-route-btn" @click="navigateToRoutes(line.id)">Editar Rotas</button>
              <button class="delete-btn" @click="deleteLine(line.id)">Eliminar Linha</button>
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colspan="4" style="text-align: center;">
              <button class="add-btn" @click="openModal('create')">Adicionar Linha</button>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal-content">
        <h2>{{ modalType === 'edit' ? 'Editar Linha' : 'Adicionar Linha' }}</h2>
        <form @submit.prevent="modalType === 'create' ? createLine() : editLine()" class="line-form">
          <div class="form-group">
            <label>Nome:</label>
            <input v-model="modalLine.name" type="text" required />
            <label>Horários:</label>
            <input v-model="modalLine.schedules" type="text" />
          </div>
          <div class="modal-actions">
            <button type="submit" class="save-btn">{{ modalType === 'edit' ? 'Salvar Alterações' : 'Criar Linha' }}</button>
            <button type="button" class="cancel-btn" @click="closeModal">Cancelar</button>
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
      lines: [], // Armazena as linhas retornadas pela API
      loading: true, // Mostra o estado de carregamento
      showModal: false, // Controla a exibição do modal
      modalType: '', // Define se o modal é para criar ou editar
      modalLine: {
        id: null,
        name: '',
        schedules: '', // Campo para os horários
      },
    };
  },
  methods: {
    // Busca as linhas da API
    async fetchLines() {
      try {
        const response = await linesService.getLines();
        console.log("Dados recebidos:", response.data); // Log para verificar a resposta
        this.lines = response.data.lines || response.data; // Ajuste para o formato correto
      } catch (error) {
        console.error("Erro ao buscar linhas:", error);
      } finally {
        this.loading = false;
      }
    },
    // Abre o modal
    openModal(type, line = null) {
      this.modalType = type;
      if (type === 'edit' && line) {
        this.modalLine = { ...line };
      } else {
        this.modalLine = { id: '', name: '', schedules: '' };
      }
      this.showModal = true;
    },
    // Fecha o modal
    closeModal() {
      this.showModal = false;
    },
    // Cria uma nova linha
    async createLine() {
      try {
        const lineData = { ...this.modalLine };
        delete lineData.id;
        const response = await linesService.createLine(lineData);
        console.log('Linha criada:', response.data.line);
        if (response.data && response.data.line && response.data.line.id) {
          this.lines.push(response.data.line);
        } else {
          console.error('A linha criada não contém dados válidos:', response.data);
        }
        this.closeModal();
      } catch (error) {
        console.error('Erro ao criar linha:', error.response?.data || error);
      }
    },
    // Edita uma linha existente
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
          console.error("Dados do motorista atualizados estão ausentes:", response.data);
        }
        await this.fetchLines();
        this.closeModal();
      } catch (error) {
        console.error("Erro ao editar linha:", error.response?.data || error);
      }
    },
    // Elimina uma linha
    async deleteLine(lineId) {
      const confirmDelete = confirm("Tem certeza de que deseja eliminar esta linha?");
      if (confirmDelete) {
        try {
          await linesService.deleteLine(lineId);
          this.lines = this.lines.filter(line => line.id !== lineId);
        } catch (error) {
          console.error("Erro ao eliminar linha:", error);
        }
      }
    },
    // Navega para as rotas
    navigateToRoutes(LineId) {
      console.log("Navegando para rota com lineId:", LineId); // Log para depuração
      this.$router.push({ name: 'routes', params: { lineId: LineId } });
    }
  },
  mounted() {
    this.fetchLines(); // Carrega as linhas ao montar o componente
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
  background: white;
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
