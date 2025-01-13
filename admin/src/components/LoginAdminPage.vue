<template>
    <div class="login">
      <h2>Admin Login</h2>
      <h2 v-if="isLoggedIn">Welcome!</h2>
      <form @submit.prevent="handleLogin">
        <div>
          <input v-model="name" type="text" placeholder="Name" required />
        </div>
        <div>
          <input v-model="password" type="password" placeholder="Password" required />
        </div>
        <button type="submit">Login</button>
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
          console.log(response);
          // save the token in localStorage
          if (response.token) {
            localStorage.setItem('authToken', response.token);
            console.log('Token armazenado:', response.token); // Adicione isso para verificar se o token está correto
            this.isLoggedIn = true;
            this.error = null;
  
            // redirect to the protected page
            this.$router.push('/index');
          } else {
            // if the API does not return a token
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
      border-color: #6200ea; /* Cor de destaque ao focar */
      background-color: #3a3a3a; /* Destaque no fundo ao focar */
    }
  
    input::placeholder {
      color: #b0b0b0; /* Cor do placeholder */
      transition: opacity 0.3s ease; /* Transição para o placeholder */
    }
  
    input:focus::placeholder {
      opacity: 0; /* Desaparece suavemente ao focar */
    }
  
    button {
      padding: 10px;
      font-size: 1rem;
      border: none;
      border-radius: 4px;
      background-color: #6200ea; /* Cor do botão */
      color: #ffffff;
      cursor: pointer;
      transition: background-color 0.3s;
    }
  
    button:hover {
      background-color: #3700b3; /* Cor do botão ao passar o mouse */
    }
  
    button:disabled {
      background-color: #555;
      cursor: not-allowed;
    }
  
    .login > button {
      margin-bottom: 20px; /* Espaço entre o botão e o restante do formulário */
      display: block;
      width: 100%; /* Faz o botão ocupar toda a largura */
    }
  
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
  