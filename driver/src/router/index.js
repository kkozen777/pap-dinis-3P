import { createRouter, createWebHistory } from 'vue-router';
import Login from '../components/LoginDriverPage.vue';
import DriverPage from '@/components/DriverPage.vue';
import TrackingPage from '@/components/TrackingPage.vue';
import SettingsPage from '@/components/SettingsPage.vue'
import authService from '@/services/authService';
import driverService from '@/services/driverService';
import { nextTick } from 'vue';

const routes = [
  { path: '/', component: Login }, // Login page
  { path: '/driver', component: DriverPage, meta: { requiresAuth: true } }, // Driver page
  { path: '/tracking', component: TrackingPage, meta: { requiresAuth: true } }, // Tracking page
  { path: '/settings', component: SettingsPage, meta: { requiresAuth: true } }, // Settings page
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => { 
  await nextTick();

  // Obtém o token
  const token = localStorage.getItem("authToken");
  // console.log("Token atual:", token);

  // Se o token não existe
  if (!token) {
    // Bloqueia as paginas protegidas e redireciona para login
    if (to.matched.some(record => record.meta.requiresAuth)) {
      return next("/"); // Página de login
    }
    // avanca caso ja exista token no browser
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
    // variavel para saber se esta em uma rota ativa
    const hasActiveRoute = response.data;
    // se esta numa rota ativa e nao esta na pagina de tracking, redireciona-o para lá
    if (hasActiveRoute && to.path === "/driver") {
      return next("/tracking");
    }

    if (!hasActiveRoute && to.path === "/tracking") {
      return next("/driver"); // Redireciona para a pagina driver caso nao esteja a fazer uma rota
    }

    if (token && to.path === "/") {
      return next("/driver"); // redireciona para a área de motorista caso tenha token e esteja no sitio de login
    }

  } catch (error) {
    console.error("Error verifying token or the driver status", error);
    authService.logout();
    return next("/"); // Redireciona para login em caso de erro
  }

  // Se nenhuma das condições anteriores bloquear a navegação, permite
  next();
});

export default router;
