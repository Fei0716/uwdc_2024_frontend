<script setup>
import HeaderNav from '@/components/HeaderNav.vue';
import {useRouter} from 'vue-router';
// states
const router = useRouter();

// methods
//redirect to create game page
function redirectToCreate(){
  router.push({name: 'CreateGame'});
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
         <button class="btn-secondary d-block mx-auto mb-2">
           JOIN A GAME
         </button>
      </div>
  </section>
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
</style>