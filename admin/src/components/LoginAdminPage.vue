<template>
  <div class="login">
    <h2>Admin Login</h2>
    <h2 v-if="isLoggedIn">Welcome!</h2>
    <form @submit.prevent="handleLogin">
      <div>
        <input v-model="name" type="text" placeholder="Name" required class="login-input"/>
      </div>
      <div>
        <input v-model="password" type="password" placeholder="Password" required class="login-input"/>
      </div>
      <button type="submit" class="login-btn">Login</button>
      <p v-if="error" class="error">{{ error }}</p>
    </form>
  </div>
</template>
  
  <script>
  import authService from '@/services/authService';
  
  export default {
    data() {
      return {
        email: '',
        password: '',
        error: null,
        isLoggedIn: null,
      };
    },
    methods: {
  
      async handleLogin() {
        try {
          // login data
          const credentials = { name: this.name, password: this.password };
  
          // call the login service
          const response = await authService.login(credentials);
          // save the token in localStorage
          if (response.token) {
            localStorage.setItem('authToken', response.token);

            this.isLoggedIn = true;
            this.error = null;
  
            this.$router.push('/index');
          } else {
            throw new Error('Token not found. Please check your credentials.');
          }
        } catch (err) {
          // display the error
          this.error = err.response?.data?.message || err.message || 'Login error.';
        }
      },
    }
  };
  </script>
  
  <style>
/* Estilos globais */
body {
  margin: 0;
  font-family: Arial, sans-serif;
  background-color: #121212; /* Cor de fundo escura */
  color: #e0e0e0; /* Texto claro */
}

.login {
  max-width: 400px;
  margin: 100px auto;
  padding: 20px;
  background-color: #1e1e1e; /* Fundo da área de login */
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
}

h2 {
  text-align: center;
  margin-bottom: 20px;
  color: #ffffff; /* Texto do título */
}

form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

/* Classe para os inputs */
.login-input {
  width: 95%;
  padding: 10px;
  font-size: 1rem;
  border: 1px solid #333;
  border-radius: 4px;
  background-color: #2c2c2c; /* Fundo dos inputs */
  color: #ffffff; /* Texto dos inputs */
  transition: border-color 0.3s ease, background-color 0.3s ease; /* Transições suaves */
}
input {
  width: 95%;
  padding: 10px;
  font-size: 1rem;
  border: 1px solid #333;
  border-radius: 4px;
  background-color: #2c2c2c; /* Fundo dos inputs */
  color: #ffffff; /* Texto dos inputs */
  transition: border-color 0.3s ease, background-color 0.3s ease; /* Transições suaves */
}
input:focus {
  outline: none;
  border-color: #272727; /* Cor de destaque ao focar */
  background-color: #3a3a3a; /* Destaque no fundo ao focar */
}
.login-input:focus {
  outline: none;
  border-color: #3776d4; /* Cor de destaque ao focar */
  background-color: #3a3a3a; /* Destaque no fundo ao focar */
}

.login-input::placeholder {
  color: #b0b0b0; /* Cor do placeholder */
  transition: opacity 0.3s ease; /* Transição para o placeholder */
}

.login-input:focus::placeholder {
  opacity: 0; /* Desaparece suavemente ao focar */
}

/* Classe para o botão */
.login-btn {
  padding: 10px;
  font-size: 1rem;
  border: none;
  border-radius: 4px;
  background-color: #224d9c; /* Cor do botão */
  color: #ffffff;
  cursor: pointer;
  transition: background-color 0.3s;
}

.login-btn:hover {
  background-color: #3700b3; /* Cor do botão ao passar o mouse */
}

.login-btn:disabled {
  background-color: #555;
  cursor: not-allowed;
}

.login > .login-btn {
  margin-bottom: 20px; /* Espaço entre o botão e o restante do formulário */
  display: block;
  width: 100%; /* Faz o botão ocupar toda a largura */
}

/* Estilo da mensagem de erro */
.error {
  color: #ff6b93; /* Cor da mensagem de erro */
  font-size: 0.9rem;
  text-align: center;
}

p {
  margin: 0;
  text-align: center;
}
</style>
