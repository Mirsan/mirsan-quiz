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
      // Jeśli przychodzimy ze strony konfiguracji, pozwalamy przejść
      if (from.path === '/start-family') {
        next()
      } else {
        // W przeciwnym razie przekierowujemy do konfiguracji
        next('/start-family')
      }
    }
  },
  {
    path: '/start-family',
    name: 'start-family',
    component: StartFamilyView
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
