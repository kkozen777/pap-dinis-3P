import { createRouter, createWebHistory } from 'vue-router';
import Login from '../components/LoginAdminPage.vue';
import DriversPage from '@/components/DriversPage.vue';
import LinesPage from '@/components/LinesPage.vue';
import RoutesPage from '@/components/RoutesPage.vue';
import IndexPage from '@/components/IndexPage.vue';

// import authService from '@/services/authService';
// import { nextTick } from 'vue';

const routes = [
  { path: '/', component: Login },
  { path: '/index', component: IndexPage, meta: { requiresAuth: true } }, // Tracking page
  { path: '/drivers', component: DriversPage, meta: { requiresAuth: true } }, // Driver page
  { path: '/lines', component: LinesPage, meta: { requiresAuth: true } }, // Tracking page
  { 
    path: '/routes/:lineId', 
    component: RoutesPage,
    props: true,
    meta: { requiresAuth: true }, 
  }, // Tracking page
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// criar o before each

export default router;