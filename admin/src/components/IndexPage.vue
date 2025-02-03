<template>
  <div class="button-container">
    <button @click="logout">Logout</button>
    <button @click="goToDriversPage">Drivers</button>
    <button @click="goToLinesAndRoutesPage">Routes and Lines</button>
    <button @click="goToPathsPage">Paths</button>
  </div>
</template>

<script>
import authService from '@/services/authService'
export default {
  name: "indexPage",
  methods: {
    goToDriversPage() {
      this.$router.push('/drivers');
    },
    goToLinesAndRoutesPage() {
      this.$router.push('/lines');
    },
    goToPathsPage() {
      this.$router.push('/paths');
    },
    logout() {
      // log out the user and redirect to the login page
      try {
        authService.logout();
        this.$router.push('/');
      } catch (error) {
        this.error = "Error during logout. Please try again.";
      }
    },
  },
};
</script>

<style scoped>
.button-container {
  text-align: center;
  margin-top: 20px;
}
button {
  margin: 10px;
  padding: 10px 20px;
  font-size: 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}
button:hover {
  background-color: #0056b3;
}
</style>
