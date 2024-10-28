<template>
  <div class="banner h-screen w-full flex items-center justify-center text-center bg-cover bg-center" :style="{ backgroundImage: `url(${backgroundImage})` }">
    <div class="bg-black bg-opacity-85 p-6 rounded-md">
      <h1 class="text-white text-5xl font-extrabold mb-4">{{ titre }}</h1>
      <p class="text-white text-xl mb-6">{{ paragraphe }}</p>
      <ButtonComponent
        :hoverBgColor="'hover:bg-secondary'"
        class="py-3 px-6"
        :to="'/product'"
      >
        {{ btnText }}
      </ButtonComponent>
    </div>
  </div>
</template>

<script>
import ButtonComponent from '../components/ButtonComponent.vue';

export default {
  components: {
    ButtonComponent
  },
  props: {
    titre: String,
    paragraphe: String,
    btnText: String,
    backgroundImage: {
      type: String,
      default: 'https://chocobonplan.com/wp-content/uploads/2024/01/slider-soldes-jeux-vid%C3%A9o-%C3%A9t%C3%A9-2024-r%C3%A9cap-global.jpg'
    }
  }
};
</script>

<style scoped>
.banner {
  height: 80vh;
  background-size: cover;
  background-position: center;
}
</style>
