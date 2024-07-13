<script setup>
import {useRoute,useRouter} from 'vue-router';
import api from '@/api';
import {ref,computed,reactive,onMounted,onUnmounted ,watch} from 'vue';
import useAuthStore  from '@/stores/auth.js'
// states
const route = useRoute();
const router = useRouter();
const game = reactive({});
const gameRound = reactive([]);
const users = reactive([]);
const isCounting = ref(false);
const countdownNumber = ref(8);
// const authStore = useAuthStore();
const currentUser = reactive(JSON.parse(localStorage.getItem('user')));
const currentOrder = ref(1);
const currentRound = ref(1);
const currentUserOrder = computed(()=>{
  return gameRound.find(g => g.player.nickname === currentUser.name)?.order;
});

//for drawing
const canvas = ref(null);
let ctx = null;
let lastX = 0;
let lastY = 0;
let isDrawing = false;
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

    if(game.drawing_data !== null){
      const img = new Image();
      img.src = game.drawing_data;
      ctx.clearRect(0, 0, canvas.value.width, canvas.value.height);
      img.onload = function() {
        ctx.drawImage(img, 0, 0);
      }
    }
  }catch(e){
    console.error(e);
  }
}
async function getGameRounds(){
  try{
    const {data} = await api.get(`/games/${route.params.link}/game-rounds`);
    gameRound.splice(0, gameRound.length);
    gameRound.push(...data);
    gameRound.sort((a , b) => a.order - b.order);
  }catch(e){
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

function startDrawing(e){
  e.preventDefault()
  if(currentUserOrder.value !== currentOrder.value){
    return;
  }
  isDrawing = true;
  lastX = e.offsetX;
  lastY = e.offsetY;
}

function drawing(e){
  e.preventDefault()
  if(!isDrawing || currentUserOrder.value !== currentOrder.value){
    return;
  }
  console.log('drawing')
  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.lineJoin = 'round';
  ctx.closePath();
  ctx.stroke();

  lastX = e.offsetX;
  lastY = e.offsetY;
}

function stopDrawing(){
  isDrawing = false;
  lastX = 0;
  lastY = 0;
}

async function updateDrawing(){
  try{
    const data = canvas.value.toDataURL();
    await api.put(`/games/${route.params.link}/drawing-data`,{
      'drawing_data' : data,
      'round_countdown': countdownNumber.value,
    });
  }catch(e){
    console.error(e);
  }
}

getPlayers();
getGame();
getGameRounds();

// methods call
let interval1  = null;
let interval2  = null;
setTimeout(() => {
  isCounting.value = true;
  countdownNumber.value = game.round_countdown;
  interval1 = setInterval(()=>{
    //pooling
    //reset the order
    if(currentOrder.value === game.player_count){
      currentOrder.value = 1;
      currentRound.value++;
    }
    else{
      currentOrder.value++;
    }
    countdownNumber.value = 8;
    getGame();
  },8000);
} , 10000);

interval2 = setInterval(()=>{
  countdownNumber.value--;
  if(countdownNumber.value === 0){
    //reach the end of the game
    if(currentRound.value === game.round_count && currentOrder.value === game.player_count){
      clearInterval(interval1);
      clearInterval(interval2);

      alert('Game End');
    }
    if(currentOrder.value == currentUserOrder.value){
      updateDrawing();
    }
    getGame();
  }
},1000);

// lifecycle hooks
onMounted(()=>{
   ctx = document.getElementById('canvas').getContext('2d');
})
onUnmounted(()=>{
  clearInterval(interval1);
  clearInterval(interval2);
});
</script>

<template>
  <section aria-label="Game Lobby Section" class="container pt-4">
    <div id="game-settings" class="mb-5 d-flex justify-content-between gap-3 align-items-center">
      <div>
        <div class="text-lg-bold">Round {{currentRound}} ({{game.round_count - currentRound}} round left)</div>
      </div>
      <div class="d-flex gap-3">
        <div class="text-lg-regular"><span class="text-lg-bold">{{game.playersJoined}}</span> Players</div>
        <div class="text-lg-regular"><span class="text-lg-bold">{{game.round_count}}</span> Rounds</div>
        <div class="text-lg-regular"><span class="text-lg-bold text-capitalize">{{game.privacy}}</span></div>
        <div class="text-lg-regular"><span class="text-lg-bold text-capitalize">{{game.mode}}</span></div>
      </div>
    </div>
    <div class="players mb-3 d-flex justify-content-between gap-2">
      <div class="d-flex justify-content-center align-items-center gap-1">
          <div v-for="g of gameRound" :key="g.id" class="player text-lg-bold" :class="{'current-player': g.order === currentOrder}">
            <div>
              {{g.player.nickname}} <span v-if="g.player.nickname === currentUser.name">(You)</span>
            </div>
            <div>
              {{g.player.round_count}}
            </div>
          </div>
      </div>
      <div v-show="!isCounting" class="text-normal-bold">
           Start in {{countdownNumber}} seconds
      </div>
      <div id="countdown" v-show="isCounting">
        <div id="countdown-number">{{countdownNumber}}</div>
        <svg>
          <circle r="18" cx="20" cy="20" id="countdown-circle" :class="{'counting' : isCounting}"></circle>
        </svg>
      </div>
    </div>

    <article class="d-flex justify-content-center mb-5">
      <canvas height="500" width="800" ref="canvas" id="canvas" @mousedown="startDrawing" @mousemove="drawing" @mouseup="stopDrawing">

      </canvas>
    </article>
  </section>
</template>

<style scoped>
  canvas{
    background-color: white;
  }
  .player{
    background-color: var(--secondary-color);
    padding: 0.5rem;
    border-radius: 0.5rem;
  }
  .current-player{
    background-color: var(--contrast-color);
  }


  #countdown {
    position: relative;
    margin: auto;
    height: 40px;
    width: 40px;
    text-align: center;
  }

  #countdown-number {
    color: white;
    display: inline-block;
    line-height: 40px;
  }

  svg {
    position: absolute;
    top: 0;
    right: 0;
    width: 40px;
    height: 40px;
    transform: rotateY(-180deg) rotateZ(-90deg);
  }

  svg circle {
    stroke-dasharray: 113px;
    stroke-dashoffset: 0px;
    stroke-linecap: round;
    stroke-width: 2px;
    stroke: white;
    fill: none;
  }
  .counting{
    animation: countdown 8s linear infinite forwards;
  }
  @keyframes countdown {
    from {
      stroke-dashoffset: 113px;
    }
    to {
      stroke-dashoffset: 0px;
    }
  }
</style>