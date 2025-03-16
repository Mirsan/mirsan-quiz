import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import FamilyView from '../views/FamilyView.vue'
import StartFamilyView from '../views/StartFamilyView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/about',
    name: 'about',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue')
  },
  {
    path: '/music',
    name: 'music',
    component: () => import(/* webpackChunkName: "about" */ '../views/MusicView.vue')
  },
  {
    path: '/family',
    name: 'family',
    component: FamilyView,
    beforeEnter: (to, from, next) => {
      // Sprawdź czy mamy konfigurację w localStorage
      const config = localStorage.getItem('familyGameConfig');
      if (config) {
        next(); // Pozwól przejść jeśli jest konfiguracja
      } else {
        next('/start-family'); // Przekieruj jeśli nie ma konfiguracji
      }
    }
  },
  {
    path: '/start-family',
    name: 'start-family',
    component: StartFamilyView
  },
  {
    path: '/',
    redirect: '/start-family'
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// Dodaj globalny guard dla bezpośredniego dostępu do /family
router.beforeEach((to, from, next) => {
  if (to.path === '/family' && from.path === '/') {
    next('/start-family');
  } else {
    next();
  }
});

export default router
