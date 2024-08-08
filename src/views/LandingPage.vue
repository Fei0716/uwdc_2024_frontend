<script setup>
import HeaderNav from '@/components/HeaderNav.vue';
import {ref} from 'vue';
import api from '../api.js';
import Notification from '@/components/Notification.vue'
import router from '../router/index.js';
// states
const notification = ref('');
// methods
//redirect to create game page
function redirectToCreate(){
  router.push({name: 'CreateGame'});
}


async function joinRandomGame(){
  try{
    const {data} = await api.post('games/join-random-game');
    if(data){
      //redirect to the game page
      router.push({name: 'GameLobby' , params : { link: data.link}});
      return;
    }

    //if no data then notified the player
    notification.value = 'There are no games available to join now, sorry and please try again later';
    setTimeout(()=>{
      notification.value = '';
    },5000);
  }catch(e){
    console.error(e);
  }
}
</script>

<template>
  <HeaderNav></HeaderNav>

  <section aria-label="Hero Section" id="section-hero">
      <div class="hero-wrapper text-center">
        <div class="text-normal-regular mb-2">Unleash your creativity</div>
        <div class="text-add-regular mb-2">within</div>
        <h1 class="mb-5">8 SECONDS</h1>
        <div class="text-add-regular mb-5">Join or create a drawing game and let your imagination run wild!</div>
         <button class="btn-primary d-block mx-auto mb-2" @click="redirectToCreate">
           CREATE NEW GAME
         </button>
         <button class="btn-secondary d-block mx-auto mb-2" @click="joinRandomGame">
           JOIN A GAME
         </button>
      </div>
  </section>


  <!--  notification component-->
  <Notification :notification="notification">
    {{notification}}
  </Notification>
</template>

<style scoped>
  #section-hero{
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    margin-top: 8%;
  }
 h1{
    font-size: 5rem!important;
 }
 .text-normal-regular{
   font-size: 28px;
 }
</style>