<template>
  <div class="bg-white shadow-lg rounded-lg overflow-hidden cursor-pointer" @click="addToCart">
    <img :src="imageSrc" :alt="imageAlt" class="w-full" />
    <div class="p-4">
      <h3 class="text-xl font-bold">{{ title }}</h3>
      <p class="text-gray-600 mb-4">{{ description }}</p>
    </div>
    <div class="flex justify-between items-center p-4 border-t">
      <span class="text-lg font-semibold text-black">{{ priceCurrent }}</span>
      <ButtonComponent 
        hoverBgColor="hover:bg-secondary"
        @click.stop="addToCart">
        Ajouter au panier
      </ButtonComponent>
    </div>
  </div>
</template>

<script>
import ButtonComponent from '../components/ButtonComponent.vue';

export default {
  components: {
    ButtonComponent,
  },
  props: {
    title: {
      type: String,
      required: true,
    },
    imageSrc: {
      type: String,
      required: true,
    },
    imageAlt: {
      type: String,
      default: "Game Image",
    },
    description: {
      type: String,
      required: true,
    },
    priceCurrent: {
      type: String,
      required: true,
    },
  },
  methods: {
    addToCart() {
      console.log(`${this.title} a été ajouté au panier.`);
    },
  },
};
</script>

<style scoped>
/* Ajoutez ici des styles supplémentaires si nécessaire */
</style>
