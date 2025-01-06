<template>
  <LoaderComponent :isVisible="loading" />
  <div v-if="!loading" class="flex h-lvh w-full md:flex-row flex-col  mt-16  p-4 justify-around ">
    <div class=" w-96 md:w-[30%] h-100">
      <CarrousellComponent v-if="!loading"
        :images="product.images.map((image, index) => ({ src: image, alt: `${product.name} image numéro ${index + 1}` }))" />
    </div>
    <div>
      <div class="p-4">
        <h3 class="text-xl font-semibold text-gray-900">
          {{ product.name }}
        </h3>
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


      <div class="flex items-center px-4 py-2 border-t space-x-2">
        <button v-for="(platform, index) in getPlatforms()" :key="index" @click="handlePlatform(platform)"
          class="w-full flex items-center justify-center rounded-md bg-gray-100	 px-5 py-2.5 text-center text-sm font-medium text-black hover:bg-gray focus:outline-none focus:ring-4 focus:ring-blue-300"
          :class="platform === platformSelected ? 'bg-[rgb(138,221,238)]' : ''">

          {{ platform }}
        </button>
      </div>

      <div class="flex items-center px-4 py-2 border-t space-x-2">
        <button v-for="(edition, index) in getEditions()" :key="index" @click="handleEdition(edition)"
          class="w-full flex items-center justify-center rounded-md bg-gray-100	 px-5 py-2.5 text-center text-sm font-medium text-black hover:bg-gray focus:outline-none focus:ring-4 focus:ring-blue-300"
          :class="edition === editionSelected ? 'bg-[rgb(138,221,238)]' : ''">
          {{ edition }}
        </button>
      </div>
      <div class="flex items-center px-4 py-2 border-t space-x-2">
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
import { VITE_API_ENDPOINT } from '@/utils/const';
import { ref } from 'vue';
import CarrousellComponent from '@/components/CarouselComponent.vue';
import { useCartStore } from '@/stores/cartStore';
import LoaderComponent from '@/components/LoaderComponent.vue';

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
    alert("Quantité demandée indisponible.");
    return;
  }

  if (editionSelected.value === '' || platformSelected.value === '') {
    alert("Veuillez sélectionner une édition et une plateforme.");
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



const handleEdition = (edition) => {
  editionSelected.value = edition;
};

const handlePlatform = (platform) => {
  platformSelected.value = platform;

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

  } catch (error) {
    console.error(error);
  }

  loading.value = false;

});

</script>