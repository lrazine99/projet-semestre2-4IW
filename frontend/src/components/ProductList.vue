<template>
  <div class="p-4">
    <h2 class="text-3xl font-extrabold mb-6 text-center text-gray-800 relative flex items-center justify-center">
      <span class="flex-grow border-t border-gray-800 mx-4"></span>
      LES MEILLEURES OFFRES
      <span class="flex-grow border-t border-gray-800 mx-4"></span>
    </h2>
    
    <div class="flex justify-center space-x-8 mb-8">
      <button 
        @click="currentFilter = 'new'" 
        :class="filterButtonClass('new')">
        Nouveautés
      </button>
      <button 
        @click="currentFilter = 'bestSellers'" 
        :class="filterButtonClass('bestSellers')">
        Meilleures ventes
      </button>
      <button 
        @click="currentFilter = 'cheapest'" 
        :class="filterButtonClass('cheapest')">
        Moins cher
      </button>
    </div>
    
    <div v-if="loading" class="text-center">Chargement des produits...</div>
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      <CardProductComponent 
        v-for="variant in displayedVariants" 
        :key="variant.sku"
        :title="variant.productName"
        :imageSrc="variant.images.length ? variant.images[0] : ''" 
        :description="variant.description" 
        :priceCurrent="variant.price"
        :platformName="variant.platform.name" 
        :edition="variant.edition" 
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import axios from 'axios';
import CardProductComponent from '../components/CardProductComponent.vue';

export default defineComponent({
  name: 'ProductList',
  components: {
    CardProductComponent,
  },
  data() {
    return {
      allVariants: [],
      loading: true,
      currentFilter: 'new',
    };
  },
  computed: {
    displayedVariants() {
      let variants = [...this.allVariants];

      switch (this.currentFilter) {
        case 'new':
          variants.sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime());
          return variants.slice(0, 8);
        case 'bestSellers':
          return variants.slice(0, 8);
        case 'cheapest':
          variants.sort((a, b) => a.price - b.price);
          return variants.slice(0, 8);
        default:
          return variants;
      }
    },
  },
  async mounted() {
    try {
      const response = await axios.get('http://localhost:8080/product');
      this.processProducts(response.data.message);
    } catch (error) {
      console.error('Erreur lors de la récupération des produits:', error);
    } finally {
      this.loading = false;
    }
  },
  methods: {
    processProducts(products) {
      this.allVariants = [];
      products.forEach(product => {
        product.variants.forEach(variant => {
          this.allVariants.push({
            productName: product.name,
            description: product.description,
            ...variant,
          });
        });
      });
    },
    filterButtonClass(filter) {
      return this.currentFilter === filter 
        ? 'text-lg text-blue-600 font-bold'
        : 'text-lg text-gray-500 hover:text-blue-500';
    },
  },
});
</script>
