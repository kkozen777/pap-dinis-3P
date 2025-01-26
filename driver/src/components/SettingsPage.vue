<template>
    <div class="settings-container">
      <!-- Botão de voltar -->
      <button class="back-button" @click="goBack">⬅</button>
  
      <!-- Título principal -->
      <h1>Settings</h1>
  
      <!-- Subtítulo -->
      <h3>Change Password</h3>
  
      <!-- Alterar Senha -->
      <div class="section">
        <input
          v-model="currentPassword"
          type="password"
          placeholder="Current Password"
        />
        <input v-model="newPassword" type="password" placeholder="New Password" />
        <button @click="changePassword">Change Password</button>
      </div>
  
      <!-- Mensagem de Erro ou Sucesso -->
      <div v-if="message" :class="messageType" class="message">{{ message }}</div>
    </div>
  </template>
  
  <script>
  import authService from "../services/authService";
  
  export default {
    data() {
      return {
        currentPassword: "",
        newPassword: "",
        message: "",
        messageType: "", // Pode ser "error" ou "success"
      };
    },
    methods: {
      goBack() {
        this.$router.push("/driver");
      },
      async changePassword() {
        try {
            console.log(this.currentPassword, this.newPassword)
          const result = await authService.changePassword(this.currentPassword, this.newPassword);
          this.message = result.message;
          this.messageType = "success";
        } catch (error) {
          this.message = error.message;
          this.messageType = "error";
        }
      },
    },
  };
  </script>
  
  <style scoped>
  body {
    margin: 0;
    font-family: Arial, sans-serif;
    background-color: #1e1e1e; /* Fundo escuro */
    color: #e0e0e0; /* Texto claro */
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
  }
  
  .settings-container {
    position: relative;
    max-width: 400px;
    width: 90%;
    padding: 20px;
    background-color: #1e1e1e; /* Fundo do container */
    border-radius: 8px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3); /* Sombra */
    text-align: center;
  }
  
  .back-button {
    position: absolute;
    top: 15px;
    right: 15px;
    width: 40px;
    height: 40px;
    background-color: #0072ff; /* Azul */
    color: white;
    border: none;
    border-radius: 50%;
    font-size: 1.2rem;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: background 0.3s ease;
  }
  
  .back-button:hover {
    background-color: #005bb5; /* Azul mais escuro no hover */
  }
  
  h1 {
    color: #ffffff; /* Cor do título principal */
  }
  
  h3 {
    color: #ffffff; /* Cor do subtítulo */
    margin-top: 20px;
  }
  
  input {
    width: calc(100% - 20px); /* Ajusta largura para respeitar padding */
    padding: 10px;
    font-size: 1rem;
    border: 1px solid #333;
    border-radius: 4px;
    background-color: #2c2c2c; /* Fundo dos inputs */
    color: #ffffff; /* Texto dos inputs */
    transition: border-color 0.3s ease, background-color 0.3s ease; /* Transições suaves */
    display: block;
    margin: 10px auto;
  }
  
  input:focus {
    outline: none;
    border-color: #00c6ff; /* Borda azul ao focar */
    background-color: #3a3a3a; /* Fundo mais claro ao focar */
  }
  
  button {
    width: 100%;
    padding: 10px;
    font-size: 1rem;
    border: none;
    border-radius: 4px;
    background: linear-gradient(to right, #00c6ff, #0072ff); /* Gradiente azul */
    color: white;
    cursor: pointer;
    transition: background 0.3s ease;
    margin-top: 10px;
  }
  
  button:hover {
    background: linear-gradient(to right, #0072ff, #00c6ff); /* Gradiente invertido no hover */
  }
  
  .message {
    font-size: 0.9rem;
    text-align: center;
    margin-top: 15px;
    padding: 10px;
    border-radius: 4px;
  }
  
  .success {
    background-color: #28a745; /* Verde para sucesso */
    color: white;
  }
  
  .error {
    background-color: #ff6b93; /* Vermelho claro para erros */
    color: white;
  }
  </style>
  