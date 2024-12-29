<template>
  <div class="card">

    <LoaderComponent :isVisible="loading" />
    <div v-if="!loading" class="card-header">

      <h3 class="card-title">{{ product?.name }}</h3>
      <div class="relative w-full h-96">
        <CarrousellComponent
          :images="product.images?.map((image, index) => ({ src: image, alt: `${product.name} image numéro ${index + 1}` }))" />
      </div>

      <div class="p-4">
        <h3 class="text-xl font-semibold text-gray-900">
          {{ product.name }}
        </h3>
        <p class="text-sm text-gray-500 mt-1">{{ product.platform }}</p>
        <p class="text-gray-700 mt-2">{{ product.description }}</p>

        <div class="flex items-center justify-between mt-4">
          <span class="text-lg font-bold text-black">{{ product.price }} €</span>
          <div class="flex items-center space-x-1">
            <button type="button" @click="decreaseQuantity" :disabled="product.quantity <= 1"
              class="w-8 h-8 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-full flex items-center justify-center focus:ring-gray-100 focus:ring-2 focus:outline-none disabled:opacity-50">
              <svg class="w-4 h-4 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14" />
              </svg>
            </button>
            <input type="text" v-model="quantity"
              class="w-10 text-center text-gray-900 text-sm border-0 focus:ring-0" />
            <button type="button" @click.stop.prevent="increaseQuantity" :disabled="product.quantity >= product.stock"
              class="w-8 h-8 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-full flex items-center justify-center focus:ring-gray-100 focus:ring-2 focus:outline-none disabled:opacity-50">
              <svg class="w-4 h-4 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 5v14m7-7H5" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div class="flex items-center px-4 py-2 bg-gray-100 border-t space-x-2">
        <button @click.stop.prevent="addToCart"
          class="w-full flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-secondary focus:outline-none focus:ring-4 focus:ring-blue-300">
          Ajouter au panier
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import axios from 'axios';
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { API_ENDPOINT } from '@/utils/const';
import { ref } from 'vue';
import CarrousellComponent from '@/components/CarouselComponent.vue';
import { useCartStore } from '@/stores/cartStore';
import LoaderComponent from '@/components/LoaderComponent.vue';

const quantity = ref(1);
const route = useRoute();
const loading = ref(true);
const product = ref({});
const siblingsProducts = ref([]);
const cartStore = useCartStore()

const addToCart = async () => {

if (quantity.value > product.stock) {
  alert("Quantité demandée indisponible.");
  return;
}

try {

  cartStore.addItem({
    sku: product.value.sku,
    title: product.value.title,
    imageSrc: product.value.imageSrc,
    price: product.value.priceCurrent,
    quantity: quantity.value,
    stock: product.value.stock,
    edition: product.value.edition,
    platform: product.value.platformName,
  });


  cartStore.syncCartWithBackend();

} catch (error) {
  alert('Erreur lors de l’ajout au panier');
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


onMounted(async () => {
  try {
    const sku = route.params?.sku || '';

    const { data: { productFound, platforms } } = await axios.get(`${API_ENDPOINT}/product/${sku}`);

    const variants = productFound.variants;

    variants.forEach((variant) => {
      variant.platform = platforms.find((platform) => platform.id === variant.platformId).name;
    });

    product.value = variants.find((item) => item.sku === sku);

    product.value.description = productFound.description;
    siblingsProducts.value = variants.filter((item) => item.sku !== sku);

  } catch (error) {
    console.error(error);
  }

  loading.value = false;

});

</script>