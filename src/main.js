import './assets/jquery/jquery.min.js'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap'
import './assets/style.css';
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import useAuthStore  from '@/stores/auth.js'
import useGameStore  from '@/stores/game.js'

import App from './App.vue'
import router from './router'

const app = createApp(App)
const pinia = createPinia();
pinia.use(()=>{
  return{
    authStore: useAuthStore(),
    gameStore: useGameStore(),
  };
});
app.use(pinia)
app.use(router)

app.mount('#app')
