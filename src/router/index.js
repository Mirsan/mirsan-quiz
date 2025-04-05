import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import FamilyView from '@/views/Family/FamilyView.vue'
import StartFamilyView from '@/views/Family/StartFamilyView.vue'
import BoardView from '@/views/Politics/BoardView.vue'
import PoliticsStartView from '@/views/Politics/PoliticsStartView.vue'
import PoliticianPanelView from '@/views/Politics/PoliticianPanelView.vue'
import JoinGameView from '@/views/Politics/JoinGameView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
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
  },
  {
    path: '/politics',
    name: 'politics-start',
    component: PoliticsStartView
  },
  {
    path: '/politics/board/:sessionId',
    name: 'politics-board',
    component: BoardView,
    props: true
  },
  {
    path: '/join-game/:sessionId',
    name: 'join-game',
    component: JoinGameView,
    props: true
  },
  {
    path: '/politician-panel/:sessionId/:deputyName',
    name: 'PoliticianPanel',
    component: PoliticianPanelView,
    props: true
  }
]

const router = createRouter({
  history: createWebHashHistory(),
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
