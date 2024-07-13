<script setup>
import {useRoute,useRouter} from 'vue-router';
import api from '@/api';
import { ref, reactive, onMounted, watch, onUnmounted } from 'vue'
import useAuthStore  from '@/stores/auth.js'
// states
const route = useRoute();
const router = useRouter();
const game = reactive({});
const currentUser = reactive({
  nickname: ''
});
const users = reactive([]);
// const authStore = useAuthStore();
// methods

// get the game details
async function getGame(){
  try{
    const {data} = await api.get(`/games/${route.params.link}`);
    Object.assign(game, data);
    //if game has started
    if(game.has_started){
      router.push({name:'Game', params:{link: route.params.link}});
    }
  }catch(e){
    console.error(e);
  }
}

async function setNickname(){
  try{
    const {data} = await api.post(`/games/${route.params.link}/players`,{
      nickname: currentUser.nickname
    });
    $('#modal-nickname').modal('hide');
    // update value in state managements
    // authStore.user.name = data.nickname;
    Object.assign(currentUser, data);
    currentUser.nickname = data.nickname;
    localStorage.setItem('user', JSON.stringify({
      name: data.nickname,
      id: data.id
    }));
  }catch(e){
    $('#modal-nickname').modal('hide');
    alert('Game Already Full!');
    router.push({name:'LandingPage'});
    console.error(e);
  }
}
async function getPlayers(){
  try{
    const {data} = await api.get(`/games/${route.params.link}/players`);
    users.splice(0, users.length);
    users.push(...data);
  }catch(e){

    console.error(e);
  }

}

async function startGame(){
  try{
    await api.put(`/games/${route.params.link}/start`);
    router.push({name:'Game', params:{link: route.params.link}});
  }catch(e){
    console.error(e);
  }
}
function copyLink(){
  navigator.clipboard.writeText(window.location.href);
}
// methods call
let interval = setInterval(()=>{
  //pooling
  getPlayers();
  getGame();
},4000);
// lifecycle hooks
onMounted(()=>{
  $('#modal-nickname').modal('show');
});

onUnmounted(()=>{
  $('#modal-nickname').modal('hide');
  clearInterval(interval);
});
</script>

<template>
<!--  modal nickname-->
   <div class="modal fade" id="modal-nickname" data-backdrop="static">
     <div class="modal-dialog modal-dialog-centered">
       <div class="modal-content">
         <div class="modal-body">
           <h1 class="text-center">Please Enter Your Nickname</h1>
           <form action="#" method="post" @submit.prevent="setNickname">
             <input type="text" name="nickname" id="nickname" class="form-control mb-3" v-model="currentUser.nickname" required>
             <button type="submit" class="btn-primary d-block mx-auto">Submit</button>
           </form>
         </div>
       </div>
     </div>
   </div>


  <section aria-label="Game Lobby Section" class="container pt-4">
      <div id="game-settings" class="mb-5 d-flex justify-content-end gap-3 align-items-center">
        <div class="text-lg-regular"><span class="text-lg-bold">{{game.playersJoined}}</span> Players</div>
        <div class="text-lg-regular"><span class="text-lg-bold">{{game.round_count}}</span> Rounds</div>
        <div class="text-lg-regular"><span class="text-lg-bold text-capitalize">{{game.privacy}}</span></div>
        <div class="text-lg-regular"><span class="text-lg-bold text-capitalize">{{game.mode}}</span></div>
        <button class="btn-primary" @click="copyLink">Share Link</button>
      </div>
      <div class="players mb-3">
         <div v-for="u of users" :key="u.id" class="player text-lg-bold">
            {{u.nickname}}
         </div>
      </div>
<!--       -->
       <button class="btn-primary mx-auto d-block" :class="{'disabled': game.playersJoined < game.player_count}" @click="startGame" >Start Game</button>
  </section>
</template>

<style scoped>
#modal-nickname .modal-body{
  background-color: var(--primary-color);
}
.players{
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
}
.player{
  background-color: var(--primary-color);
  border-radius: 100%;
  height: auto;
  width: fit-content;
  font-size: 4rem;
  padding: 1rem 2rem;
}
.disabled{
  cursor: default;
  filter: grayscale(1);
  color: var(--neutral-color-4);
}
</style>