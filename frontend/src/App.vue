<script setup>
import HeaderComponent from './components/HeaderComponent.vue'
import FooterComponent from './components/FooterComponent.vue'
import { onMounted } from 'vue'
import { initFlowbite } from 'flowbite'

onMounted(() => {
  initFlowbite();
})
</script>

<template>
  <div id="app">

    <div class="flex flex-col h-screen bg-gray-200">
      <HeaderComponent />

      <div class="flex justify-center items-center flex-grow flex-col mt-16 pb-6 bg-gray-200">
        <router-view />
      </div>
      <FooterComponent />
    </div>
  </div>
</template>

