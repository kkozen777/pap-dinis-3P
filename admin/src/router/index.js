import { createRouter, createWebHistory } from 'vue-router';
import Login from '../components/LoginAdminPage.vue';
import DriversPage from '@/components/DriversPage.vue';
import LinesPage from '@/components/LinesPage.vue';
import RoutesPage from '@/components/RoutesPage.vue';
import IndexPage from '@/components/IndexPage.vue';
import PathsPage from '@/components/pathsPage.vue';
import authService from '@/services/authService';
import { nextTick } from 'vue';

const routes = [
  { path: '/', component: Login },
  { path: '/index', component: IndexPage, meta: { requiresAuth: true } }, // Tracking page
  { path: '/drivers', component: DriversPage, meta: { requiresAuth: true } }, // Driver page
  { path: '/lines', component: LinesPage, meta: { requiresAuth: true } }, // Tracking page
  { path: '/paths', component: PathsPage, meta: { requiresAuth: true } }, // Tracking page
  { 
    path: '/routes/:lineId', 
    name: 'routes',
    component: RoutesPage,
    props: true,
    meta: { requiresAuth: true }, 
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  await nextTick(); // Garante que o DOM está atualizado

  const token = localStorage.getItem("authToken");
  // console.log("Token atual:", token);

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
      if (!isTokenExpired && (to.path === "/")) {
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