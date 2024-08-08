import {defineStore} from 'pinia';
import {reactive,watch} from 'vue';

const useGameStore = defineStore('game' , ()=>{
  /*state*/
  const game = reactive({
    id: null,
    link: null,
    player_count: null,
    privacy: null,
    mode: null,
    round_count: null,
  });
  // initial value ....
  if(localStorage.getItem('game')){
    Object.assign(game, JSON.parse(localStorage.getItem('game')));
  }
  watch(game , (newVal) =>{
    localStorage.setItem('game'  ,JSON.stringify(newVal));
  },{
    deep: true
  });
  /*actions*/

  /*getters(like computed)*/

  return {
    game,
  }
});

export default useGameStore;