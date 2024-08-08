<script setup>
import {useRoute} from 'vue-router';
import api from '@/api';
import {ref,computed,reactive,onMounted,onUnmounted } from 'vue';
//
import Notification from '@/components/Notification.vue';
import router from '../router/index.js';
// states
const route = useRoute();
const game = ref({});
const gameRound = ref([]);
const users = ref([]);
const countdownNumber = ref(8);
const notification = ref('');
// const authStore = useAuthStore();
const currentUser = reactive(JSON.parse(localStorage.getItem('user')));
const currentOrder = ref(1);
const currentRound = ref(1);

const currentUserOrder = computed(()=>{
  return gameRound.value.find(g => g.player.nickname === currentUser.name)?.order;
});


//get the order of the next player
const nextPlayer = computed(()=>{
  let i = 1;
  if(currentOrder.value < users.value.length){
    i = currentOrder.value + 1
  }else{
    // eslint-disable-next-line vue/no-side-effects-in-computed-properties
    if(currentRound.value < game.value.round_count){
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      currentRound.value++;

    }
  }
  return i;
});
//static data
const freehandWords = ["Dragon", "Pizza", "Rocket", "Unicorn", "Robot", "Castle", "Dinosaur", "Mermaid", "Superhero", "Spaceship"];
//instant response flags
let gameInstantResponse = '?instantResponse=true';
let playerInstantResponse = '?instantResponse=true';
let gameRoundInstantResponse = '?instantResponse=true';

//for countdown
let interval = null;
let timerInterval = null;
let gameEnded = false;
let gameInitialCounter = ref(0);

//for drawing
const canvas = ref(null);
let ctx = null;
let lastX = 0;
let lastY = 0;
let isDrawing = false;
let hasDrawn  = false;
let toggleGif = false;
let finalGif = ref(null);

// methods
let finalGifSrc = computed(()=>{
  return 'https://backend.test:8443/storage/'+ finalGif.value;
});
// get the game details
async function getGame(){
  try{
    const {data} = await api.get(`/games/${route.params.link}/${gameInstantResponse}`);
    game.value = data;
    gameInstantResponse ='';
    //draw the retrace image if the game mode is set retrace
    if(game.value.mode === 'retrace'){
      const img = new Image();
      img.src = `/svg/${game.value.draw_item_index}.svg`;
      img.onload = function() {
        ctx.drawImage(img, 0 , 0 ,canvas.value.width,canvas.value.height  );
        //to apply washout effect
        ctx.fillStyle = 'rgba(255,255,255,0.76)'; // Adjust alpha value (0.3) to control washout intensity
        ctx.fillRect(0, 0, canvas.value.width, canvas.value.height);
        //draw watermark to show acknowledgement for using svg from Freepik
        ctx.font = "30px Arial"; // Correct way to set the font
        ctx.fillStyle = "rgba(135,135,135,0.76)";   // Correct way to set the fill color
        ctx.fillText("Freepik.com",  canvas.value.width - 200, canvas.value.height - 40); // Adjusted y position for better visibility
      }
    }
    if(game.value.drawing_data){
      const img = new Image();
      img.src = game.value.drawing_data;
      // ctx.clearRect(0, 0, canvas.value.width, canvas.value.height);
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
    const {data} = await api.get(`/games/${route.params.link}/game-rounds/${gameRoundInstantResponse}`);
    gameRound.value = [];
    gameRound.value.push(...data);
    gameRound.value.sort((a , b) => a.order - b.order);//sort by order in ascending order
    gameRoundInstantResponse = '';

    if(data[0].game.drawing_data && !hasDrawn){//if has drawn some image then no need to refresh the canvas
      const img = new Image();
      img.src = data[0].game.drawing_data;
      //ctx.clearRect(0, 0, canvas.value.width, canvas.value.height);
      img.onload = function() {
        ctx.drawImage(img, 0, 0);
      }
    }
    //check whether the game has ended
    if(data[0].game.has_ended){
      // alert('Game End!!');
      clearInterval(interval);
      clearInterval(timerInterval);
      countdownNumber.value = 0;
      if(!toggleGif){
        getFinalGif();
        toggleGif = true;
      }
      gameEnded = true;
      return;
    }
    hasDrawn = false;

    await getGameRounds();
  }catch(e){
    console.error(e);
  }
}
async function updateRoundsData(){
  try{
    countdownNumber.value = 8;
    //only if current user can upload their drawing data
    if(currentOrder.value !== currentUserOrder.value){
      currentOrder.value = nextPlayer.value;
      return;
    }
    const dataURL = canvas.value.toDataURL();
    const {data} = await api.put(`/games/${route.params.link}/players/${currentUser.id}/game-rounds`,{
      'drawing_data' : dataURL,
      'round_countdown': countdownNumber.value,
    });
    // if the current reach the end of the game
    if(data.order === users.value.length && data.round_left === 0){
      // alert('Game End!!');
      clearInterval(interval);
      clearInterval(timerInterval);
      if(!toggleGif){
        getFinalGif();
        toggleGif = true;
      }
      gameEnded = true;
      countdownNumber.value = 0;
      return;
    }
    currentOrder.value = nextPlayer.value;

  }catch(e){
    console.error(e);
  }
}
async function getPlayers(){
  try{
    const {data} = await api.get(`/games/${route.params.link}/players/${playerInstantResponse}`);
    users.value = [];
    users.value.push(...data);
    playerInstantResponse = '';
  }catch(e){
    console.error(e);
  }

}

function startDrawing(e){
  hasDrawn  = true;
  e.preventDefault()
  if(currentUserOrder.value !== currentOrder.value || gameEnded){
    return;
  }
  isDrawing = true;
  lastX = e.offsetX;
  lastY = e.offsetY;
}

function drawing(e){
  e.preventDefault()
  if(!isDrawing || currentUserOrder.value !== currentOrder.value || gameEnded){
    return;
  }
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

function updateInterval(){
  if(gameRound.value[0]?.game.has_ended){
    return;
  }
  countdownNumber.value = 8;
  updateRoundsData();
}

function copyLink(){
  notification.value = 'Link for the gif has been copied, share it to the world now!';
  setTimeout(()=>{
    notification.value = '';
  },5000);
  navigator.clipboard.writeText(finalGifSrc.value);
}

function redirectToLandingPage(){
  router.push({name: 'LandingPage'});
}

async function getFinalGif(){
  try{
    const {data} = await api.get(`/games/${route.params.link}/final-gif`);
    finalGif.value = data;
    $('#modal-gif').modal('show');
  }catch(e){
    console.error(e);
  }
}
getPlayers();
getGame();
getGameRounds();
timerInterval = setInterval(()=>{
  if(gameInitialCounter.value >= 0 &&  gameInitialCounter.value < 7 ){
    gameInitialCounter.value++;
  }else if(gameInitialCounter.value === 7){
    countdownNumber.value = 8;
    gameInitialCounter.value = -1;
  }
  console.log(gameInitialCounter.value)
  if(countdownNumber.value > 1){
    countdownNumber.value--;
  }
},1000);

setTimeout(()=>{
  interval = setInterval(updateInterval, 8000);
},8000);

// lifecycle hooks
onMounted(()=>{
   ctx = document.getElementById('canvas').getContext('2d');

   document.addEventListener('mouseup' , function(){
      if(isDrawing){
        isDrawing = false;
        lastX = 0;
        lastY = 0;
      }
   });
})
onUnmounted(()=>{

});
</script>

<template>
  <section aria-label="Game Lobby Section" class="container pt-2">
    <div id="game-settings" class="mb-2 d-flex justify-content-between gap-3 align-items-center">
      <div>
        <div class="text-lg-bold" id="round-title">Round {{currentRound}}</div>
      </div>
      <div class="d-flex gap-3">
        <div class="text-lg-regular"><span class="text-lg-bold">{{game.playersJoined}}</span> Players</div>
        <div class="text-lg-regular"><span class="text-lg-bold">{{game.round_count}}</span> Rounds</div>
        <div class="text-lg-regular"><span class="text-lg-bold text-capitalize">{{game.privacy}}</span></div>
        <div class="text-lg-regular"><span class="text-lg-bold text-capitalize">{{game.mode}}</span></div>
      </div>
    </div>
    <div class="d-flex justify-content-center align-items-center gap-3">
      <div v-for="(g,i) of gameRound" :key="g.id" class="player text-lg-bold text-center" :class="{'current-player': g.order === currentOrder}">
        <div>
          <strong class="sd-block">{{g.player.nickname}} <span v-if="g.player.nickname === currentUser.name">(You)</span></strong>
        </div>
        <div class="text-center text-normal-bold text-decoration-underline">
          {{gameRound[i].round_left === 0 ? 'Rounds Ended' : gameRound[i].round_left + ' Rounds Left'}}
        </div>
      </div>
    </div>
    <h1 class="d-block text-center my-2 draw-title" v-if="game.mode === 'freehand'">{{freehandWords[game.draw_item_index]}}</h1>
    <h1 class="d-block text-center my-2 draw-title" v-else-if="game.mode === 'retrace'">Retrace The Image</h1>
    <article class="d-flex justify-content-center mb-5" id="drawing-wrapper">
<!--      <div v-show="!isCounting" class="text-normal-bold">-->
<!--        Start in {{countdownNumber}} seconds-->
<!--      </div>-->
      <div id="countdown" v-show="!gameEnded">
          <strong class="d-block text-nowrap">{{gameInitialCounter !== -1 ? 'Starts In ' : ''}}</strong>
          <div class="number text-center" >
            {{countdownNumber}}
          </div>
      </div>
      <canvas height="500" width="800" ref="canvas" id="canvas" @mousedown="startDrawing" @mousemove="drawing" @mouseup="stopDrawing">

      </canvas>
    </article>
  </section>


  <!--  modal final gif-->
  <div class="modal modal-xl fade" id="modal-gif" data-backdrop="static">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header d-flex justify-content-center">
          <h1 class="text-center text-black">Game End!!!</h1>
        </div>
        <div class="modal-body">
          <img v-if="finalGif" :src="finalGifSrc" class="mx-auto img-fluid d-block mb-3" alt="Final Gif">
          <div class="d-flex justify-content-center gap-2">
            <button class="btn-primary" data-bs-dismiss="modal" @click="redirectToLandingPage">Exit Game</button>
            <button class="btn-secondary"  @click="copyLink">Share Link</button>
          </div>
        </div>
      </div>
    </div>
  </div>


<!--  notification component-->
  <Notification :notification="notification">
    {{notification}}
  </Notification>
</template>

<style scoped>
  canvas{
    background-color: white;
  }
  .draw-title{
    font-size: 4rem;
  }
  .player{
    background-color: var(--secondary-color);
    padding: 0.5rem;
    border-radius: 0.5rem;
    background-clip: padding-box;
    transition: all 0.2s ease;
    overflow: hidden;
  }
  .current-player{
    background-color: var(--contrast-color);
    position: relative;
    background-clip: padding-box!important;
    transition: all 0.2s ease;
    border: 4px dashed rgba(91, 91, 91, 0.73);
    animation: borderChangingEffect 1s ease infinite forwards;
  }
  @keyframes borderChangingEffect{
    0%,100%{
      border: 4px dashed rgba(91, 91, 91, 0.73);
    }
    50%{
      border: 4px dashed rgba(255, 255, 255, 0.64);
    }
  }
  #round-title{
    font-size: 3rem!important;
  }


  #drawing-wrapper{
    position: relative;

  }
  #countdown{
    position: absolute;
    top: 20%;
    left: 0;
    transform: translateY(-50%);
    perspective: 1000px;
    transform-style: preserve-3d;
    width: max-content;
  }
  #countdown > strong:first-child{
    color: transparent;
    font-size:3rem;
    -webkit-text-stroke-width: 2px;
    -webkit-text-stroke-color: white;
  }
  #countdown  .number{
    text-align: center;
    width: fit-content;
    height: fit-content;
    position: absolute;
    top: 50%;
    left: 0;
    font-size: 10rem;
    opacity: 0;
    -webkit-text-stroke-width: 3px;
    -webkit-text-stroke-color: white;
    color: transparent;
    transform: scale(0.5) rotateY(270deg);
    animation: rotateAnimation 1s ease infinite forwards;
  }
  @keyframes rotateAnimation{
    to{
      transform: scale(1) rotateY(360deg);
      opacity: 1;
    }
  }
  #modal-gif{
    background-color: var(--primary-color);
  }
  .btn-secondary{
    padding: 14px 13px;
    height: 53px;
    font-size: 18px;
  }
</style>