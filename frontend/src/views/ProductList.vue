<template>
  <div class="container mx-auto p-6 mt-16">
    <!-- Grille avec filtres et produits -->
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">

      <!-- Colonne de filtres -->
      <aside class="bg-white shadow-lg rounded-lg p-6 border border-gray-200 sticky top-20 self-start">
        <h3 class="text-2xl font-semibold text-gray-700 mb-6">Filtres</h3>

        <!-- Barre de recherche -->
        <div class="mb-6">
          <h4 class="font-medium text-gray-600 mb-2">Recherche</h4>
          <input v-model="searchQuery" type="text" placeholder="Rechercher dans le nom ou la description..."
            class="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-300" />
        </div>

        <div class="mb-6">
          <h4 class="font-medium text-gray-600 mb-6 cursor-pointer flex items-center justify-between"
            @click="toggleGenreFilter">
            Genres
            <span class="text-gray-500 text-xl">{{ isGenreOpen ? '-' : '+' }}</span>
          </h4>
          <hr class="border-t border-gray-300 mb-2" />
          <ul v-show="isGenreOpen">
            <li v-for="genre in genres" :key="genre" class="flex items-center space-x-2 mb-2 cursor-pointer">
              <label class="flex items-center space-x-2 w-full">
                <input type="checkbox" v-model="selectedGenres" :value="genre"
                  class="form-checkbox text-blue-500 focus:ring-0" />
                <span class="text-gray-700">{{ genre }}</span>
              </label>
            </li>
          </ul>
        </div>

        <div class="mb-6">
          <h4 class="font-medium text-gray-600 mb-6 cursor-pointer flex items-center justify-between"
            @click="togglePlatformFilter">
            Plateformes
            <span class="text-gray-500 text-xl">{{ isPlatformOpen ? '-' : '+' }}</span>
          </h4>
          <hr class="border-t border-gray-300 mb-2" />
          <ul v-show="isPlatformOpen">
            <li v-for="platform in platforms" :key="platform" class="flex items-center space-x-2 mb-2 cursor-pointer">
              <label class="flex items-center space-x-2 w-full">
                <input type="checkbox" v-model="selectedPlatforms" :value="platform"
                  class="form-checkbox text-green-500 focus:ring-0" />
                <span class="text-gray-700">{{ platform }}</span>
              </label>
            </li>
          </ul>
        </div>

        <!-- Filtre par prix (slider et champ manuel) -->
        <div class="mb-6">
          <h4 class="font-medium text-gray-600 mb-2">Prix Maximum</h4>
          <div class="flex items-center space-x-4">
            <input type="range" v-model="priceRange.max" :max="maxPrice" :min="0"
              class="w-full h-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg cursor-pointer focus:outline-none transition duration-300"
              step="0.01" />
          </div>
          <div class="flex justify-between text-sm text-gray-600 mt-2">
            <span>0€</span>
            <input v-model="priceRange.max" type="text" step="0.01" :max="maxPrice" :min="0"
              class="w-16 text-center text-gray-900 text-sm border-0 focus:ring-0" />
            <span>{{ maxPrice.toFixed(2) }}€</span>
          </div>
        </div>

        <!-- Tri -->
        <div class="mb-6">
          <h4 class="font-medium text-gray-600 mb-2">Trier par</h4>
          <select v-model="sortOrder"
            class="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300">
            <option value="dateDesc">Plus récent</option>
            <option value="dateAsc">Plus ancien</option>
            <option value="priceAsc">Prix : croissant</option>
            <option value="priceDesc">Prix : décroissant</option>
            <option value="nameAsc">Nom : A - Z</option>
            <option value="nameDesc">Nom : Z - A</option>
          </select>
        </div>

        <!-- Bouton de réinitialisation des filtres -->
        <div class="mt-3">
          <button @click="resetFilters"
            class="w-full py-3 bg-gray-300 text-black rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 transition duration-300">
            Réinitialiser les filtres
          </button>
        </div>
      </aside>

      <!-- Grille des produits -->
      <div class="col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <div class="row-start-1 col-span-3 min-h-96 border-2 ">
          <div v-if="displayedVariants.length === 0" class="col-span-3 text-center text-lg text-gray-500">
            Aucun produit ne correspond à vos critères.
          </div>


          <!-- Card produits -->
          <CardProductComponent v-for="product in currentPageProducts" :key="product.sku" :sku="product.sku"
            :title="product.productName"
            :imageSrc="product.images.length ? product.images[0] : 'https://via.placeholder.com/200'"
            :description="product.description" :priceCurrent="product.price" :platformName="product.platform.name"
            :edition="product.edition" :stock="product.stock" />

        </div>
        <!-- Pagination -->
        <div class="col-span-6 mt-6 flex justify-center content-center h-16">
          <div class=" h-inherit ">
            <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1"
              class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400">
              Précédent
            </button>
            <span class="text-lg">{{ currentPage }} / {{ totalPages }}</span>
            <button @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages"
              class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400">
              Suivant
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import axios from 'axios';
import CardProductComponent from '../components/CardProductComponent.vue';

const router = useRouter();
const route = useRoute();

const allVariants = ref([]);
const genres = ref([]);
const platforms = ref([]);
const selectedGenres = ref(route.query.genres ? route.query.genres.split(',') : []);
const selectedPlatforms = ref(route.query.platforms ? route.query.platforms.split(',') : []);
const priceRange = ref({
  min: 0,
  max: route.query.maxPrice ? parseFloat(route.query.maxPrice) : 100,
});
const searchQuery = ref(route.query.search || '');
const sortOrder = ref(route.query.sortOrder || 'dateDesc');
const currentPage = ref(route.query.page ? parseInt(route.query.page as string, 10) : 1);

const isGenreOpen = ref(false);
const isPlatformOpen = ref(false);

const itemsPerPage = ref(12);
const displayedVariants = ref([]);
const totalPages = ref(1);
const maxPrice = ref(100);

const processProducts = (products) => {
  allVariants.value = [];
  products.forEach(product => {
    product.variants.forEach((variant) => {
      allVariants.value.push({
        productName: product.name,
        description: product.description,
        category: product.category,
        genres: product.genres,
        ...variant,
      });
    });
  });
};

const filteredVariants = computed(() => {
  let variants = [...allVariants.value];

  if (searchQuery.value) {
    variants = variants.filter(product =>
      product.productName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  }

  if (selectedGenres.value.length) {
    variants = variants.filter(product =>
      selectedGenres.value.some(genre => product.genres.includes(genre))
    );
  }

  if (selectedPlatforms.value.length) {
    variants = variants.filter(product =>
      selectedPlatforms.value.includes(product.platform.name)
    );
  }

  variants = variants.filter(product =>
    product.price <= priceRange.value.max
  );

  switch (sortOrder.value) {
    case 'dateAsc': {
      variants.sort((a, b) => new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime());
      break;
    }
    case 'dateDesc': {
      variants.sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime());
      break;
    }
    case 'priceAsc':
      variants.sort((a, b) => a.price - b.price);
      break;
    case 'priceDesc':
      variants.sort((a, b) => b.price - a.price);
      break;
    case 'nameAsc':
      variants.sort((a, b) => a.productName.localeCompare(b.productName));
      break;
    case 'nameDesc':
      variants.sort((a, b) => b.productName.localeCompare(a.productName));
      break;
  }

  return variants;
});

const currentPageProducts = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage.value;
  const endIndex = startIndex + itemsPerPage.value;
  return filteredVariants.value.slice(startIndex, endIndex);
});

const applyFilters = () => {
  totalPages.value = Math.ceil(filteredVariants.value.length / itemsPerPage.value);
  displayedVariants.value = currentPageProducts.value;
};

const changePage = (page) => {
  currentPage.value = Math.max(1, Math.min(page, totalPages.value));
};

const resetFilters = () => {
  selectedGenres.value = [];
  selectedPlatforms.value = [];
  priceRange.value = { min: 0, max: maxPrice.value };
  searchQuery.value = '';
  sortOrder.value = 'dateDesc';
  currentPage.value = 1;

  router.push({
    query: {},
  });

  applyFilters();
};

watch(
  [selectedGenres, selectedPlatforms, searchQuery, priceRange, sortOrder],
  () => {
    currentPage.value = 1;
    router.push({
      query: {
        genres: selectedGenres.value.join(','),
        platforms: selectedPlatforms.value.join(','),
        search: searchQuery.value || undefined,
        maxPrice: priceRange.value.max || undefined,
        sortOrder: sortOrder.value || undefined,
        page: currentPage.value,
      },
    });
    applyFilters();
  },
  { deep: true }
);

onMounted(async () => {
  try {
    const response = await axios.get('http://localhost:8080/product');
    processProducts(response.data.message);

    genres.value = Array.from(new Set(allVariants.value.flatMap(product => product.genres)));
    platforms.value = Array.from(new Set(allVariants.value.map(product => product.platform.name)));

    maxPrice.value = Math.max(...allVariants.value.map(product => product.price));
    priceRange.value.max = priceRange.value.max || maxPrice.value;

    totalPages.value = Math.ceil(filteredVariants.value.length / itemsPerPage.value);
    totalPages.value = Math.ceil(filteredVariants.value.length / itemsPerPage.value);

    totalPages.value = Math.ceil(filteredVariants.value.length / itemsPerPage.value);

    displayedVariants.value = currentPageProducts.value;
  } catch (error) {
    console.error('Erreur lors de la récupération des produits:', error);
  }
});

const toggleGenreFilter = () => {
  isGenreOpen.value = !isGenreOpen.value;
};

const togglePlatformFilter = () => {
  isPlatformOpen.value = !isPlatformOpen.value;
};
</script>