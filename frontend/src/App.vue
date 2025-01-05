<script setup>
import HeaderComponent from './components/HeaderComponent.vue'
import FooterComponent from './components/FooterComponent.vue'
import CookiePopUpComponent from './components/CookiePopUpComponent.vue'
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

      <div class="flex justify-center items-center flex-grow flex-col bg-gray-200">
        <CookiePopUpComponent />
        <router-view />
      </div>
      <FooterComponent />
    </div>
  </div>
</template>

