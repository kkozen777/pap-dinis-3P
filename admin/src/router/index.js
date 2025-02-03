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
  { path: '/index', component: IndexPage, meta: { requiresAuth: true } },
  { path: '/drivers', component: DriversPage, meta: { requiresAuth: true } },
  { path: '/lines', component: LinesPage, meta: { requiresAuth: true } },
  { path: '/paths', component: PathsPage, meta: { requiresAuth: true } },
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
  await nextTick();

  const token = localStorage.getItem("authToken");
  // console.log("Token atual:", token);

  if (!token) {
    if (to.matched.some(record => record.meta.requiresAuth)) {
      return next("/");
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
        return next("/index");
      }
    } catch (error) {
      console.error("Error ao verifying token:", error);
      authService.logout();
      return next("/"); 
    }
  }

  next();
});


export default router;