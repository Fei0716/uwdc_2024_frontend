import { createRouter, createWebHistory } from 'vue-router'
import LandingPage from '@/views/LandingPage.vue'
import CreateGame from '@/views/CreateGame.vue'
import GameLobby from '@/views/GameLobby.vue'
import Game from '@/views/Game.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'LandingPage',
      component: LandingPage,
    },
    {
      path: '/create-game',
      name: 'CreateGame',
      component: CreateGame,
    },
    {
      path: '/game-lobby/:link',
      name: 'GameLobby',
      component: GameLobby,
    },
    {
      path: '/game/:link',
      name: 'Game',
      component: Game,
    },
    {
      path: '/:catchAll(.*)',
      redirect:  '/',
    }
  ]
})
//
export default router
