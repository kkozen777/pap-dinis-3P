<template>
    <div>
      <h1>Settings</h1>
  
      <!-- Alterar Senha -->
      <div>
        <h3>Change Password</h3>
        <input v-model="currentPassword" type="password" placeholder="Current Password" />
        <input v-model="newPassword" type="password" placeholder="New Password" />
        <button @click="changePassword">Change Password</button>
      </div>
  
      <!-- Alterar Email -->
      <div>
        <h3>Change Email</h3>
        <input v-model="newEmail" type="email" placeholder="New Email" />
        <button @click="changeEmail">Change Email</button>
      </div>
  
      <!-- Excluir Conta -->
      <div>
        <h3>Delete Account</h3>
        <button @click="deleteAccount" class="delete-button">Delete Account</button>
      </div>
  
      <!-- Mensagem de Erro ou Sucesso -->
      <div v-if="message" :class="messageType">{{ message }}</div>
    </div>
  </template>
  
  <script>
  import authService from "../services/authService";
  
  export default {
    data() {
      return {
        currentPassword: "",
        newPassword: "",
        newEmail: "",
        message: "",
        messageType: "", // Pode ser "error" ou "success"
      };
    },
    methods: {
      async changePassword() {
        try {
          const result = await authService.changePassword(this.currentPassword, this.newPassword);
          this.message = result.message;
          this.messageType = "success";
        } catch (error) {
          this.message = error.message;
          this.messageType = "error";
        }
      },
  
      async changeEmail() {
        try {
          const result = await authService.changeEmail(this.newEmail);
          this.message = result.message;
          this.messageType = "success";
        } catch (error) {
          this.message = error.message;
          this.messageType = "error";
        }
      },
  
      async deleteAccount() {
        const confirmDelete = confirm("Are you sure you want to delete your account? This action cannot be undone.");
        if (confirmDelete) {
          try {
            const result = await authService.deleteAccount();
            this.message = result.message;
            this.messageType = "success";
          } catch (error) {
            this.message = error.message;
            this.messageType = "error";
          }
        }
      },
    },
  };
  </script>
  
  <style scoped>
  .success {
    color: green;
  }
  .error {
    color: red;
  }
  .delete-button {
    background-color: red;
    color: white;
  }
  </style>
  