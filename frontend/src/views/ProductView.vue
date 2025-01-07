<template>
  <LoaderComponent :isVisible="loading" />
  <div v-if="!loading" class="flex h-lvh w-full flex-col md:flex-row mt-8 p-6 justify-center items-center gap-6">
    <!-- Left Section: Carousel -->
    <div class="w-full md:w-1/3 flex justify-center">
      <CarrousellComponent
        :images="product.images.map((image, index) => ({ src: image, alt: `${product.name} image numéro ${index + 1}` }))" />
    </div>

    <!-- Right Section: Product Details -->
    <div class="w-full md:w-2/3 bg-white rounded-lg shadow-md p-6 space-y-6">
      <!-- Product Title & Description -->
      <div>
        <h3 class="text-2xl font-semibold text-gray-900">{{ product.name }}</h3>
        <p class="text-gray-600 mt-2">{{ product.description }}</p>
      </div>

      <!-- Price and Quantity Controls -->
      <div class="flex items-center justify-between">
        <span class="text-xl font-bold text-gray-900">{{ product.price }} €</span>
        <div class="flex items-center space-x-2">
          <button type="button" @click="decreaseQuantity" :disabled="product.quantity <= 1"
            class="w-10 h-10 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center disabled:opacity-50">
            <svg class="w-5 h-5 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14" />
            </svg>
          </button>
          <input type="text" v-model="quantity"
            class="w-12 text-center border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400" />
          <button type="button" @click="increaseQuantity" :disabled="product.quantity >= product.stock"
            class="w-10 h-10 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center disabled:opacity-50">
            <svg class="w-5 h-5 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 5v14m7-7H5" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Platforms -->
      <div class="space-y-2">
        <h4 class="text-lg font-medium text-gray-800">Platform:</h4>
        <div class="flex items-center space-x-2">
          <button v-for="(platform, index) in getPlatforms()" :key="index" @click="handlePlatform(platform)"
            class="px-4 py-2 rounded-md border text-sm font-medium hover:bg-gray-200 focus:outline-none"
            :class="platform === platformSelected ? 'bg-blue-500 text-white' : 'bg-gray-100'">
            {{ platform }}
          </button>
        </div>
      </div>

      <!-- Editions -->
      <div class="space-y-2">
        <h4 class="text-lg font-medium text-gray-800">Edition:</h4>
        <div class="flex items-center space-x-2">
          <button v-for="(edition, index) in getEditions()" :key="index" @click="handleEdition(edition)"
            class="px-4 py-2 rounded-md border text-sm font-medium hover:bg-gray-200 focus:outline-none"
            :class="edition === editionSelected ? 'bg-blue-500 text-white' : 'bg-gray-100'">
            {{ edition }}
          </button>
        </div>
      </div>

      <!-- Add to Cart Button -->
      <div>
        <button @click="addToCart" :disabled="product.stock < 1"
          :class="product.stock < 1 ? 'bg-[rgb(115,170,224)]' : 'bg-primary hover:bg-blue-600'"
          class="w-full px-4 py-2 rounded-md bg-blue-500 text-white text-center text-lg font-medium  focus:outline-none focus:ring-4 focus:ring-blue-300">
          <i class="pi pi-cart-minus mr-2" style="font-size: 1.1rem"></i>
          <span>Ajouter au panier</span> </button>
      </div>
    </div>
  </div>

</template>

<script setup>
import axios from 'axios';
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { VITE_API_ENDPOINT } from '@/utils/const';
import { ref } from 'vue';
import CarrousellComponent from '@/components/CarouselComponent.vue';
import { useCartStore } from '@/stores/cartStore';
import LoaderComponent from '@/components/LoaderComponent.vue';
import { toast } from 'vue3-toastify';

const quantity = ref(1);
const route = useRoute();
const loading = ref(true);
const product = ref({});
const siblingsProducts = ref([]);
const cartStore = useCartStore();
const editionSelected = ref('');
const platformSelected = ref('');

const getEditions = () => {
  const editions = siblingsProducts.value.map(({ edition }) => edition);

  editions.push(product.value.edition);
  return [...new Set(editions)];
};


const getPlatforms = () => {
  const platforms = siblingsProducts.value.map(({ platform }) => platform);
  platforms.push(product.value.platform);

  return [...new Set(platforms)];
};


const addToCart = async () => {

  if (quantity.value > product.value?.stock) {
    toast.alert('Quantité demandée indisponible.', {
        autoClose: 1000,
    });
    return;
  }

  if (editionSelected.value === '' || platformSelected.value === '') {
    toast.error('Veuillez sélectionner une édition et une plateforme.', {
        autoClose: 1000,
    });
    return;
  }

  product.value = siblingsProducts.value.find((item) => item.edition === editionSelected.value
    && item.platform === platformSelected.value);


  try {

    cartStore.addItem({
      sku: product.value.sku,
      title: product.value.name,
      imageSrc: product.value.images[0],
      price: product.value.price,
      quantity: quantity.value,
      stock: product.value.stock,
      edition: product.value.edition,
      platform: product.value.platform,
    });


  } catch (error) {
    toast.error('Erreur lors de l’ajout au panier', {
        autoClose: 1000,
    });
    console.error('Erreur ajout au panier:', error.response ? error.response.data : error.message);
  }
};

const increaseQuantity = () => {
  if (quantity.value < product.value.stock) {
    quantity.value++;
  }
};

const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--;
  }
};



const handleEdition = (edition) => {
  editionSelected.value = edition;

  product.value = siblingsProducts.value.find((item) => item.edition === edition && item.platform === platformSelected.value) || siblingsProducts.value.find((item) => item.edition === edition);


  platformSelected.value = product.value.platform;
  editionSelected.value = product.value.edition;


};

const handlePlatform = (platform) => {

  product.value = siblingsProducts.value.find((item) => item.edition === editionSelected.value && item.platform === platform) || siblingsProducts.value.find((item) => item.platform === platform);

  platformSelected.value = product.value.platform;
  editionSelected.value = product.value.edition;

};

onMounted(async () => {
  try {
    const sku = route.params?.sku || '';

    const { data: { productFound, platforms } } = await axios.get(`${VITE_API_ENDPOINT}/product/${sku}`);

    const variants = productFound.variants;

    variants.forEach((variant) => {
      variant.description = productFound.description;
      variant.name = `${productFound.name} - ${variant.name}`;
      variant.platform = platforms.find((platform) => platform._id === variant.platform).name;
    });
    product.value = variants.find((item) => item.sku === sku);
    editionSelected.value = product.value.edition;
    platformSelected.value = product.value.platform;
    siblingsProducts.value = variants;
    console.log(getEditions())

  } catch (error) {
    console.error(error);
  }

  loading.value = false;

});

</script>