<template>
  <div class="login-container">
    <div class="install-container" v-if="deferredPrompt">
        <img 
      src="@/assets/downloadbutton.png" 
      alt="Install PWA" 
      class="install-button" 
      @click="installPWA" 
    />
      <span class="install-label">(Android only)</span>
    </div>
    <h2>Driver Login</h2>
    <h2 v-if="isLoggedIn">Welcome!</h2>
    <form @submit.prevent="handleLogin">
      <div class="input-group">
        <input
          v-model="driverNumber"
          type="number"
          placeholder="Driver Number"
          required
        />
      </div>
      <div class="input-group">
        <input
          v-model="password"
          type="password"
          placeholder="Password"
          required
        />
      </div>
      <button type="submit" class="login-button">Login</button>
      <p v-if="error" class="error-message">{{ error }}</p>
    </form>
  </div>
</template>



<script>
import authService from '@/services/authService';

export default {
  data() {
    return {
      driverNumber: '',
      password: '',
      error: null,
      isLoggedIn: null,
      deferredPrompt: null,

    };
  },
  created() {
    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      this.deferredPrompt = event;
    });
  },
  methods: {
    async handleLogin() {
      try {
        // login data
        const credentials = { driverNumber: this.driverNumber, password: this.password };

        // call the login service
        const response = await authService.login(credentials);

        // save the token in localStorage
        if (response.token) {
          localStorage.setItem('authToken', response.token);
          this.isLoggedIn = true;
          this.error = null;

          // redirect to the protected page
          this.$router.push('/driver');
        } else {
          // if the API does not return a token
          throw new Error('Token not found. Please check your credentials.');
        }
      } catch (err) {
        // display the error
        this.error = err.response?.data?.message || err.message || 'Login error.';
      }
    },
    async installPWA() {
      if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
          window.location.href = '/';
        } else if (this.deferredPrompt) {
          this.deferredPrompt.prompt();
          this.deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
              console.log('User accepted the install prompt');
            } else {
              console.log('User dismissed the install prompt');
            }
            this.deferredPrompt = null;
          });
        } else {
          alert('Not supported by the browser.');
        }
      },
  },
};
</script>

<style>
body {
  margin: 0;
  font-family: Arial, sans-serif;
  background-color: #1e1e1e; /* Fundo escuro */
  color: #e0e0e0; /* Texto claro */
}

.login-container {
  position: relative; /* Necessário para que elementos posicionados absolutamente fiquem relativos a ele */
  max-width: 400px;
  margin: 100px auto;
  padding: 20px;
  background-color: #1e1e1e; /* Fundo do container */
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  text-align: center;
}

/* Container para o botão de instalar, posicionado no canto superior esquerdo do .login-container */
.install-container {
  position: absolute;
  top: 10px;
  left: 10px; /* Posicionado no canto superior esquerdo do container */
  display: flex;
  flex-direction: column; /* Alinha os elementos verticalmente */
  align-items: center;
}

.install-button {
  width: 50px; /* Tamanho do botão */
  cursor: pointer;
}

.install-label {
  margin-top: 5px; /* Espaço acima da label */
  font-size: 12px;
  color: gray;
}

h2 {
  color: #ffffff; /* Cor do título */
}

.input-group {
  margin-bottom: 25px; /* Espaço maior entre os campos */
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
}

input:focus {
  outline: none;
  border-color: #00c6ff; /* Borda azul ao focar */
  background-color: #3a3a3a; /* Fundo mais claro ao focar */
}

.login-button {
  width: 100%;
  padding: 10px;
  font-size: 1rem;
  border: none;
  border-radius: 4px;
  background: linear-gradient(to right, #00c6ff, #0072ff); /* Gradiente azul */
  color: white;
  cursor: pointer;
  transition: background 0.3s ease;
}

.login-button:hover {
  background: linear-gradient(to right, #0072ff, #00c6ff); /* Gradiente invertido no hover */
}

.login-text {
  font-size: 0.9rem;
  margin: 10px 0;
  color: #ffffff; /* Texto branco */
}

.login-text a {
  color: #00c6ff; /* Azul claro no link */
  cursor: pointer;
  text-decoration: none;
  transition: color 0.3s ease;
}

.login-text a:hover {
  color: #0072ff; /* Azul mais forte no hover */
}

.error-message {
  color: #ff6b93; /* Vermelho claro para mensagens de erro */
  font-size: 0.9rem;
  text-align: center;
}
</style>