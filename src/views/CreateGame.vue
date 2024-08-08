<script setup>
import api from '@/api';
import {reactive,ref,computed} from 'vue';
import {useRouter} from 'vue-router'
import useGameStore  from '@/stores/game.js'
import Notification from '@/components/Notification.vue'


// states
const gameStore = useGameStore();
const game = reactive({
  player_count: 2,
  round_count: 1,
  privacy: 'public',
  mode: 'freehand'
});
const gameLink = ref(null);
const fullGameLink = computed(()=>{
  return `${window.location.origin}/game-lobby/${gameLink.value}`;
});
const link = ref(null);
const router = useRouter();
const notification = ref('');

 // methods
 async function createNewGame(){
    try{
      const {data} = await api.post('/games',{
        player_count: game.player_count,
        round_count: game.round_count,
        privacy: game.privacy,
        mode: game.mode,
      });
      gameStore.id = data.id;
      gameStore.link = data.link;
      gameStore.player_count = data. privacy;
      gameStore.mode = data.mode;
      gameStore.round_count = data.round_count;

      gameLink.value = data.link;

      setTimeout(()=>{
        gameLink.value = null;
        router.push({name:'GameLobby' , params:{link: data.link}});
      },5000);
    }catch(e){
      console.error(e);
    }
 }
 function copyLink(){
   notification.value = 'Link for the game has been copied, share it to the world now!';
   setTimeout(()=>{
     notification.value = '';
   },5000);
   navigator.clipboard.writeText(fullGameLink.value);
 }
</script>

<template>
  <Transition name="form" mode="in-out" v-if="gameLink==null" appear>
    <section aria-label="Create New Game Section" class="pt-5">
      <div id="create-wrapper">
        <h1 class="text-center mb-4">Create New Game</h1>
        <form action="" @submit.prevent="createNewGame" method="post">
          <div class="mb-2">
            <label for="player_count" class="text-normal-bold">Number Of Player</label>
            <input type="number" step="1" max="10" min="2" id="player_count" name="player_count" class="form-control" v-model="game.player_count" required>
          </div>
          <div class="mb-2">
            <label for="round_count" class="text-normal-bold">Number Of Rounds</label>
            <input type="number" step="1" min="1" id="round_count" name="round_count" class="form-control" v-model="game.round_count" required>
          </div>
          <div class="mb-2">
            <label for="privacy" class="text-normal-bold">Game Visibility</label>
            <select name="privacy"  id="privacy" class="form-select" v-model="game.privacy" >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>
          <div class="mb-4">
            <label for="mode" class="text-normal-bold">Game Mode</label>
            <select name="mode"  id="mode" class="form-select" v-model="game.mode" >
              <option value="freehand">Freehand</option>
              <option value="retrace">Retrace</option>
            </select>
          </div>

          <div class="d-flex gap-2 justify-content-center">
            <button class="btn-primary" type="submit">Create</button>
            <button class="btn-secondary" type="reset">Reset</button>
          </div>
        </form>
      </div>

    </section>
  </Transition>
  <Transition name="form" mode="in-out" v-else appear>
    <section aria-label="Game Created Section" class="pt-5">
      <div id="create-wrapper">
        <h1 class="text-center mb-4">Game Created</h1>
        <div class="text-center">
          <p class="text-normal-regular">Game created successfully!</p>
          <p class="text-normal-regular">Will be redirected to the game lobby after 5 seconds</p>
          <p class="text-normal-regular">Share this link with your friends to join the game</p>
          <p class="text-normal-bold d-flex align-items-center gap-2 justify-content-center"><RouterLink id="link" class="text-normal-bold" :to="{name:'GameLobby', params:{link: gameLink}}">{{fullGameLink}}</RouterLink> <button class="btn-primary" @click="copyLink">Share</button></p>
        </div>
      </div>
    </section>
  </Transition>

  <!--  notification component-->
  <Notification :notification="notification">
    {{notification}}
  </Notification>
</template>

<style scoped>
 #create-wrapper{
   width: 500px;
   padding: 1rem 1.25rem;
   border-radius: 0.5rem;
   margin: 12px auto 0;
 }
 .form-enter-active, .form-leave-active {
   transition: opacity 0.5s;
 }
 .form-enter-to, .form-leave-from {
   opacity: 0;
 }
 .form-enter-to, .form-leave-from {
   opacity: 1;
 }
</style>