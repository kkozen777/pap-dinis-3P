import { createRouter, createWebHistory } from 'vue-router';
import Login from '../components/LoginDriverPage.vue';
import DriverPage from '@/components/DriverPage.vue';
import TrackingPage from '@/components/TrackingPage.vue';
import authService from '@/services/authService';
import driverService from '@/services/driverService';
import { nextTick } from 'vue';

const routes = [
  { path: '/', component: Login }, // Login page
  { path: '/driver', component: DriverPage, meta: { requiresAuth: true } }, // Driver page
  { path: '/tracking', component: TrackingPage, meta: { requiresAuth: true } }, // Tracking page
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => { 
  await nextTick(); // Garante que o DOM está atualizado

  // Obtém o token de autenticação
  const token = localStorage.getItem("authToken");
  console.log("Token atual:", token);

  // Se o token não existe
  if (!token) {
    // Bloqueia rotas protegidas e redireciona para login
    if (to.matched.some(record => record.meta.requiresAuth)) {
      return next("/"); // Página de login
    }
    // Permite a navegação para rotas públicas
    return next();
  }

  try {
    // Verifica se o token está expirado
    const isTokenExpired = await authService.isTokenExpired(token);

    if (isTokenExpired) {
      authService.logout(); // Remove token expirado
      return next("/"); // Redireciona para login
    }

    // Verifica o estado do motorista
    const response = await driverService.getDriverStatus();
    const hasActiveRoute = response.data;
    console.log(" TEM ROTA ? ",hasActiveRoute);
    // Lógica de redirecionamento baseada no estado
    if (hasActiveRoute && to.path === "/driver") {
      return next("/tracking"); // Redireciona para o tracking
    }

    if (!hasActiveRoute && to.path === "/tracking") {
      return next("/driver"); // Redireciona para a área de motorista
    }

    if (token && to.path === "/") {
      return next("/driver"); // Redireciona para a área de motorista
    }

  } catch (error) {
    console.error("Erro ao verificar o token ou estado do motorista:", error);
    authService.logout(); // Garante que o token inválido seja removido
    return next("/"); // Redireciona para login em caso de erro
  }

  // Se nenhuma das condições anteriores bloquear a navegação, permite
  next();
});

export default router;
