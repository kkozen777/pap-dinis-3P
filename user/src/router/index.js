import { createRouter, createWebHistory } from 'vue-router';
import SignupPage from '@/components/SignupPage.vue';
import LoginPage from '../components/LoginUserPage.vue';  // Assuming you already have the login component
import IndexPage from '@/components/IndexPage.vue';
import MapPage from '@/components/MapPage.vue';
import authService from '@/services/authService.js';
import { nextTick } from 'vue';

const routes = [
  { path: '/', component: LoginPage }, // Login page
  { path: '/signup', component: SignupPage }, // Signup page
  { path: '/index', component: IndexPage, meta: { requiresAuth: true } }, // Protected page
  {
    path: '/map/:routeId', // Define the route with a dynamic parameter
    name: 'MapPage',
    component: MapPage,
    props: true, // Pass route parameters as props
    meta: { requiresAuth: true }, // Protected page
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  await nextTick(); // Garante que o DOM está atualizado

  const token = localStorage.getItem("authToken");
  console.log("Token atual:", token);

  if (!token) {
    // Se o token não existe e a rota requer autenticação, redireciona para login
    if (to.matched.some(record => record.meta.requiresAuth)) {
      return next("/"); // Página de login
    }
  } else {
    try {
      const isTokenExpired = await authService.isTokenExpired(token);

      if (isTokenExpired) {
        // Se o token está expirado, realiza logout e redireciona para login
        authService.logout();
        return next("/");
      }

      // Bloqueia acesso às rotas públicas para usuários autenticados
      if (!isTokenExpired && (to.path === "/" || to.path === "/signup")) {
        return next("/index"); // Redireciona para a página protegida
      }
    } catch (error) {
      console.error("Erro ao verificar o token:", error);
      authService.logout();
      return next("/"); // Redireciona para login em caso de erro
    }
  }

  next(); // Permite a navegação para outras rotas
});


export default router;
