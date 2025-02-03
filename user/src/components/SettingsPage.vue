<template>
  <div class="settings-container">

    <button class="back-button" @click="goBack">⬅</button>

    <h1>Settings</h1>


    <div class="section">
      <h3>Change Password</h3>
      <input v-model="currentPassword" type="password" placeholder="Current Password" />
      <input v-model="newPassword" type="password" placeholder="New Password" />
      <button @click="changePassword">Change Password</button>
    </div>


    <div class="section">
      <h3>Change Email</h3>
      <input v-model="newEmail" type="email" placeholder="New Email" />
      <button @click="changeEmail">Change Email</button>
    </div>


    <div class="section">
      <h3>Delete Account</h3>
      <button @click="deleteAccount" class="delete-button">Delete Account</button>
    </div>


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
        newEmail: "",
        message: "",
        messageType: "",
      };
    },
    methods: {
      goBack() {
        this.$router.push('/index');
    },
      async changePassword() {
      if (this.newPassword.length < 6) {
          this.message = "Password must be at least 6 characters long.";
          this.messageType = "error";
          return;
        }
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
            const response = authService.logout(); // Calls the logout method from the service
            if (response) {
              this.$router.push("/");
            } else {
              alert("Error!");
            }
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
    position: relative; /* Permite posicionar o botão dentro do container */
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

  .settings-container {
    max-width: 400px;
    margin: 100px auto;
    padding: 20px;
    background-color: #1e1e1e; /* Fundo do container */
    border-radius: 8px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3); /* Sombra */
    text-align: center;
  }

  h1 {
    color: #ffffff; /* Cor do título principal */
  }

  h3 {
    color: #ffffff; /* Cor dos subtítulos */
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

  .delete-button {
    background: linear-gradient(to right, #ff4b5c, #ff6b6b); /* Gradiente vermelho */
  }

  .delete-button:hover {
    background: linear-gradient(to right, #ff6b6b, #ff4b5c); /* Gradiente vermelho invertido */
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