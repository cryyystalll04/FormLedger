import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import pinia from '@/stores/index.js';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'welcome',
      component: () => import('@/views/WelcomePage.vue'),
    },
    {
      path: '/',
      redirect: '/login', // Add this redirect
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/Login.vue'), // Corrected component name
    },
      {
      path: '/signup',
      name: 'signup',
      component: () => import('@/views/SignupPage.vue'),
    },
    {
      path: '/user-forms',
      name: 'user-forms',
      component: () => import('@/views/UserFormsPage.vue'),
      meta: { requiresAuth: true, requiresUser: true },
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/views/DashboardPage.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/create-form',
      name: 'create-form',
      component: () => import('@/views/FormCreationPage.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/forms/:id',
      name: 'form-renderer',
      component: () => import('@/views/FormRendererPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/submissions/:id',
      name: 'submissions',
      component: () => import('@/views/SubmissionsPage.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/edit-submission/:id',
      name: 'edit-submission',
      component: () => import('@/views/SubmissionEditPage.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
  ],
});

router.beforeEach((to, from, next) => {
  // Pass the Pinia instance to the store
  const authStore = useAuthStore(pinia); 

  // Check if the route requires authentication and if the user is not authenticated
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next('/login');
  } 

  
   if (authStore.token && !authStore.user) {
    // Decode the JWT to get the user's role and save it to the store
    // You'll need a library like 'jwt-decode' for this
    // For simplicity, let's assume the user object is already in the store
    // We'll add this feature later
    // For now, let's assume authStore.user is populated after login
  }

  // Role-based routing
  if (to.meta.requiresAdmin && authStore.user?.role !== 'admin') {
    return next('/user-forms');
  }

  if (to.meta.requiresUser && authStore.user?.role !== 'user') {
    return next('/dashboard'); // Or another appropriate redirect
  }

  next();
});

export default router;