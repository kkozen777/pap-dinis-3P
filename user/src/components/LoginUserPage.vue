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
    <!-- <img src="@/assets/logo.png" alt="fastBus Logo" class="logo" /> -->
    <h2>User Login</h2>
    
    <h2 v-if="isLoggedIn">Welcome!</h2>
    <form @submit.prevent="handleLogin">
      <div class="input-group">
        <input v-model="email" type="text" placeholder="Email" required />
      </div>
      <div class="input-group">
        <input v-model="password" type="password" placeholder="Password" required />
      </div>
      <p class="login-text">Don't have an account ? <a href="#" @click.prevent="goToSignup">Signup</a></p>
      <button type="submit" class="login-button">Login</button>
      <p v-if="error" class="error">{{ error }}</p>
    </form>
  </div>
</template>
<script>
import authService from '@/services/authService';

export default {
  data() {
    return {
      email: '',         // guarda o email do utilizador
      password: '',      // guarda a password do utilizador
      error: null,       // guarda mensagens de erro de login
      isLoggedIn: null,  // verifica se o utilizador está autenticado(se já tem token no browser ou nao)
      deferredPrompt: null, // guarda o evento 'beforeinstallprompt' para a PWA

    };
  },

  // Ao criar a app (carregar o site), isto acontece: 
  created() {
    // Ao abrir a app web, aparece automaticamente a janela para instalar como pwa
    // O que não deve acontecer, pois existe um botão para isso, então
    // isto deixa esse painel desativado até o utilizador quiser instalar
    window.addEventListener('beforeinstallprompt', (event) => {
      
      // Impede o comportamento padrão do navegador, que mostraria o painel automaticamente
      event.preventDefault();
      
      // Armazena o evento para uso posterior, e isto permite que a app 
      // exiba o prompt de instalação manualmente quando desejar
      this.deferredPrompt = event;
    });
},
  methods: {
    async goToSignup() {
      // redireciona para a signup page
      this.$router.push("/signup");
    },

    async handleLogin() {
      try {
        // login data
        const credentials = { email: this.email, password: this.password };

        // chama o service que trata do login
        const response = await authService.login(credentials);
        // guarda o token na local storage
        if (response.token) {
          localStorage.setItem('authToken', response.token);
          this.isLoggedIn = true;
          this.error = null;

          // redirecionada para a pagina index
          this.$router.push('/index');
        } else {
          // caso haja um erro
          throw new Error('Token not found. Please check your credentials.');
        }
      } catch (err) {
        // mostra o erro
        this.error = err.response?.data?.message || err.message || 'Login error.';
      }
    },
    async installPWA() {
      // Verifica se a PWA já está instalada
      if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
        // Se a PWA já estiver instalada, redireciona para a página principal
        window.location.href = '/';
      } 
      // Caso a PWA ainda não esteja instalada e o evento 'beforeinstallprompt' tenha sido guardado
      else if (this.deferredPrompt) {
        // Exibe o prompt de instalação
        this.deferredPrompt.prompt();

        // Aguarda a escolha do utilizador (aceitar ou rejeitar a instalação)
        this.deferredPrompt.userChoice.then((choiceResult) => {
          if (choiceResult.outcome === 'accepted') {
            console.log('User accepted the install prompt.');
          } else {
            console.log('O utilizador rejeitou a instalação da PWA.');
          }

          // Depois de usado, limpa a variável 'deferredPrompt'
          this.deferredPrompt = null;
        });
      } 
      // Se o navegador não suportar a instalação de PWAs
      else {
        alert('Not supported by the browser.');
      }
    },
  }
};
</script>

<style>
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

  body {
    margin: 0;
    font-family: Arial, sans-serif;
    background-color: #1e1e1e; /* Fundo escuro */
    color: #e0e0e0; /* Texto claro */
  }

  .login-container {
    max-width: 400px;
    margin: 100px auto;
    padding: 20px;
    background-color: #1e1e1e; /* Fundo do container */
    border-radius: 8px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3); /* Sombra */
    text-align: center;
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
  .logo {
    width: 150px;
    display: block;
    margin: 0 auto 20px;
  }
</style>
