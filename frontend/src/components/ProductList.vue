<template>
  <div class="p-4">
    <h2 class="text-3xl font-extrabold mb-6 text-center text-gray-800 relative flex items-center justify-center">
      <span class="flex-grow border-t border-gray-800 mx-4"></span>
      LES MEILLEURES OFFRES
      <span class="flex-grow border-t border-gray-800 mx-4"></span>
    </h2>
    
    <div class="flex justify-center space-x-8 mb-8">
      <button @click="currentFilter = 'new'" :class="filterButtonClass('new')">
        Nouveautés
      </button>
      <button @click="currentFilter = 'bestSellers'" :class="filterButtonClass('bestSellers')">
        Meilleures ventes
      </button>
      <button @click="currentFilter = 'cheapest'" :class="filterButtonClass('cheapest')">
        Moins cher
      </button>
    </div>

    <LoaderComponent v-if="loading" />
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      <CardProductComponent v-for="variant in displayedVariants" :key="variant.sku" :sku="variant.sku"
        :title="variant.productName" :imageSrc="variant.images.length ? variant.images[0] : ''"
        :description="variant.description" :priceCurrent="variant.price" :platformName="variant.platform.name"
        :edition="variant.edition" :stock="variant.stock" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import CardProductComponent from '../components/CardProductComponent.vue';
import { VITE_API_ENDPOINT } from '@/utils/const';
import LoaderComponent from './LoaderComponent.vue';

const allVariants = ref([]);
const loading = ref(true);
const currentFilter = ref('new');

const displayedVariants = computed(() => {
  let variants = [...allVariants.value];

  switch (currentFilter.value) {
    case 'new':
      variants.sort(
        (a, b) =>
          new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
      );
      return variants.slice(0, 8);
    case 'bestSellers':
      return variants.slice(0, 8);
    case 'cheapest':
      variants.sort((a, b) => a.price - b.price);
      return variants.slice(0, 8);
    default:
      return variants;
  }
});

const processProducts = (products) => {
  allVariants.value = [];
  products.forEach(product => {
    product.variants.forEach((variant) => {
      allVariants.value.push({
        productName: product.name,
        description: product.description,
        ...variant,
      });
    });
  });
};

const processPlatforms = (platforms) => {
  allVariants.value.forEach((variant) => {
    
    
    variant.platform = platforms.find((platform) => platform._id === variant.platform);
  });

};

const filterButtonClass = (filter) =>
  currentFilter.value === filter
    ? 'text-lg text-blue-600 font-bold'
    : 'text-lg text-gray-500 hover:text-blue-500';

onMounted(async () => {
  try {
    const { data: { productsFound, platforms } } = await axios.get(`${VITE_API_ENDPOINT}/product`);
    
    processProducts(productsFound);
    processPlatforms(platforms);
  } catch (error) {
    console.error('Erreur lors de la récupération des produits:', error);
  } finally {
    loading.value = false;
  }
});
</script>
