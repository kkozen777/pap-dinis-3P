<template>
  <div class="signup-page">
    <h1>Signup</h1>
    <form @submit.prevent="handleSignup">
      <div class="form-group">
        <input
          type="text"
          id="name"
          v-model="name"
          placeholder="Name"
          required
        />
      </div>
      <div class="form-group">
        <input
          type="email"
          id="email"
          v-model="email"
          placeholder="Email"
          required
        />
      </div>
      <div class="form-group">
        <input
          type="password"
          id="password"
          v-model="password"
          placeholder="Password"
          required
        />
      </div>
      <button type="submit">Signup</button>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    </form>
  </div>
</template>


<script>
import authService from "@/services/authService";

export default {
  name: "SignupPage",
  data() {
    return {
      name: "",
      email: "",
      password: "",
      errorMessage: "",
    };
  },
  methods: {
    async handleSignup() {
      try {
        const user = { name: this.name, email: this.email, password: this.password };
        await authService.signup(user); // Call the signup service
        this.$router.push("/"); // Redirects to the login page
      } catch (error) {
        this.errorMessage = error.response?.data?.message || "Failed to signup. Please try again.";
      }
    },
  },
};
</script>

<style scoped>
body {
  margin: 0;
  font-family: Arial, sans-serif;
  background-color: #121212; /* Fundo escuro */
  color: #e0e0e0; /* Texto claro */
}

.signup-page {
  max-width: 400px;
  margin: 100px auto;
  padding: 20px;
  background-color: #1e1e1e; /* Fundo da área de signup */
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
}

h1 {
  text-align: center;
  margin-bottom: 20px;
  color: #ffffff; /* Título */
}

.form-group {
  position: relative;
  margin-bottom: 20px;
}

input {
  width: 95%;
  padding: 10px;
  font-size: 1rem;
  border: 1px solid #333;
  border-radius: 4px;
  background-color: #2c2c2c; /* Fundo do input */
  color: #ffffff; /* Texto do input */
  transition: border-color 0.3s ease, background-color 0.3s ease;
}

input:focus {
  outline: none;
  border-color: #6200ea; /* Destaque ao focar */
  background-color: #3a3a3a; /* Fundo ao focar */
}

input::placeholder {
  color: #b0b0b0; /* Cor do placeholder */
  transition: opacity 0.3s ease; /* Transição suave */
}

input:focus::placeholder {
  opacity: 0; /* Esconde o placeholder ao digitar */
}

button {
  width: 100%;
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
  background-color: #3700b3; /* Cor ao passar o mouse */
}

button:disabled {
  background-color: #555;
  cursor: not-allowed;
}

.error {
  color: #ff6b6b; /* Mensagem de erro */
  font-size: 0.9rem;
  text-align: center;
  margin-top: 10px;
}
</style>
