import { createRouter, createWebHistory } from 'vue-router';
import SignupPage from '@/components/SignupPage.vue';
import LoginPage from '../components/LoginUserPage.vue';
import IndexPage from '@/components/IndexPage.vue';
import MapPage from '@/components/MapPage.vue';
import SettingsPage from '@/components/SettingsPage.vue';
import authService from '@/services/authService.js';
import { nextTick } from 'vue';

const routes = [
  { path: '/', component: LoginPage }, // Login page
  { path: '/signup', component: SignupPage }, // Signup page
  { path: '/index', component: IndexPage, meta: { requiresAuth: true } }, // Protected page
  { path: '/settings', component: SettingsPage, meta: { requiresAuth: true } }, // Protected page
  {
    path: '/map/:routeId', // route with a dynamic parameter
    name: 'MapPage',
    component: MapPage,
    props: true, // route parameters as props
    meta: { requiresAuth: true }, // is a protected page
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

      if (!isTokenExpired && (to.path === "/" || to.path === "/signup")) {
        return next("/index");
      }
    } catch (error) {
      console.error("Errot verifying token:", error);
      authService.logout();
      return next("/"); // Redireciona para login em caso de erro
    }
  }

  next();
});


export default router;
