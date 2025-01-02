<template>
  <div class="banner h-screen w-full flex items-center justify-center text-center bg-cover bg-center" :style="{ backgroundImage: `url(${backgroundImage})` }">
    <div class="bg-black bg-opacity-85 p-6 rounded-md">
      <h1 class="text-white text-5xl font-extrabold mb-4">{{ titre }}</h1>
      <p class="text-white text-xl mb-6">{{ paragraphe }}</p>
      <ButtonComponent
        :hoverBgColor="'hover:bg-secondary'"
        class="py-3 px-6"
        :to="'/produits'"
      >
        {{ btnText }}
      </ButtonComponent>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';
import ButtonComponent from '../components/ButtonComponent.vue';

defineProps({
  titre: String,
  paragraphe: String,
  btnText: String,
  backgroundImage: {
    type: String,
    default: 'https://i.pinimg.com/736x/0d/cc/7e/0dcc7efba2c6b14c8a75663c0d8e3907.jpg',
  },
});
</script>

<style scoped>
.banner {
  height: 80vh;
  background-size: cover;
  background-position: center;
}
</style>
