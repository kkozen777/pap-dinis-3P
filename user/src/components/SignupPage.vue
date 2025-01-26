<template>
  <div class="signup-container">
    <h2>Sign Up</h2>
    <form @submit.prevent="handleSignup">
      <div class="input-group">
        <input v-model="email" type="text" placeholder="Email" required />
      </div>
      <div class="input-group">
        <input v-model="password" type="password" placeholder="Password" required />
      </div>
      <div class="input-group">
        <input v-model="confirmPassword" type="password" placeholder="Confirm Password" required />
      </div>
      <p v-if="error" class="error-message">{{ error }}</p>
      <button type="submit" class="sign-up-button">Sign Up</button>
      <p class="sign-in-text">Already have an account? <a href="#" @click.prevent="goToLogin">Login</a></p>
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
      confirmPassword: '',
      error: null,
    };
  },
  methods: {
    async handleSignup() {
  if (this.password !== this.confirmPassword) {
    this.error = "Passwords do not match.";
    return;
  }

  try {
    const credentials = { email: this.email, password: this.password, name: this.name };
    const response = await authService.signup(credentials);

    console.log("Signup response:", response);

    // Verifica se a resposta contém a mensagem esperada
    if (response.data?.message === "User created successfully") {
      this.$router.push("/"); // Redireciona para a página inicial
    } else {
      throw new Error("Signup error."); // Apenas lança erro se a resposta não for esperada
    }
  } catch (err) {
    console.error("Signup error:", err);

    if (err.response?.status === 400) {
      this.error = "User already exists.";
    } else {
      this.error = err.response?.data?.error || "Error creating user.";
    }
  }
},
    goToLogin() {
      this.$router.push('/');
    }
  }
};
</script>
<style>
body {
  margin: 0;
  font-family: Arial, sans-serif;
  background-color: #1e1e1e;
  color: #e0e0e0;
}

.signup-container {
  max-width: 400px;
  margin: 100px auto;
  padding: 20px;
  background-color: #1e1e1e;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  text-align: center;
}

h2 {
  color: #ffffff;
}

.input-group {
  margin-bottom: 15px;
}

input {
  width: calc(100% - 20px);
  padding: 10px;
  font-size: 1rem;
  border: 1px solid #333;
  border-radius: 4px;
  background-color: #2c2c2c;
  color: #ffffff;
}

input:focus {
  outline: none;
  border-color: #00c6ff;
  background-color: #3a3a3a;
}

.sign-up-button {
  width: 100%;
  padding: 10px;
  font-size: 1rem;
  border: none;
  border-radius: 4px;
  background: linear-gradient(to right, #00c6ff, #0072ff);
  color: white;
  cursor: pointer;
}

.sign-up-button:hover {
  background: linear-gradient(to right, #0072ff, #00c6ff);
}

.sign-in-text {
  font-size: 0.9rem;
  color: white;
}

.sign-in-text a {
  color: #00c6ff;
  cursor: pointer;
}

.error-message {
  color: #ff6b93;
  font-size: 0.9rem;
  text-align: center;
}
</style>