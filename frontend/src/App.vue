<script setup>
import HeaderComponent from './components/HeaderComponent.vue'
import FooterComponent from './components/FooterComponent.vue'
</script>

<template>
  <div id="app">
    <div class="flex flex-col h-screen bg-gray-200">
      <HeaderComponent />

      <div class="flex justify-center items-center flex-grow flex-col bg-gray-200">
        <router-view />
      </div>

      <FooterComponent />
    </div>
  </div>
</template>
