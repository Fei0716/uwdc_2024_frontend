<script setup>
  import {ref, watchEffect} from 'vue';

  const props = defineProps(['notification']);
  const notification = ref(props.notification);
  watchEffect(()=>{
    notification.value = props.notification;
  });

</script>

<template>
  <Transition name="notification" mode="in-out">
    <output v-if="notification" class="notification">
      <div class="notification-wrapper">
        <slot></slot>
      </div>
    </output>
  </Transition>


</template>

<style scoped>
.notification{
  position: absolute;
  right: 0;
  top: 12px;
  border-top-left-radius: 1rem;
  border-bottom-left-radius: 1rem;
  padding: 1rem 2rem;
  background-color: var(--primary-color);
  color: var(--neutral-color-2);
  font-size: 1rem;
  text-align: center;
  z-index: 9999;
  border: 2px solid var(--neutral-color-1);
}

.notification-enter-to, .notification-leave-from{
  opacity: 1;
  transform: translateX(0%) scale(1);
}
.notification-enter-active , .notification-leave-active{
  transition: all 0.2s ease;
  transform:  scale(1);
}
.notification-enter-from, .notification-leave-to{
  opacity: 0;
  transform: scale(1.2) translateX(50%);
}
</style>