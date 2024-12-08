<template>
  <div class="bg-white shadow-lg rounded-lg overflow-hidden w-80 mx-auto cursor-pointer mb-8">
    <div class="relative w-full h-96">
      <img :src="imageSrc" :alt="imageAlt" class="w-full h-full object-fill" />
    </div>

    <div class="p-4">
      <h3 class="text-xl font-semibold text-gray-900">
        {{ title }} - <span class="text-sm text-gray-600">{{ edition }}</span>
      </h3>
      <p class="text-sm text-gray-500 mt-1">{{ platformName }}</p>
      <p class="text-gray-700 mt-2">{{ truncatedDescription }}</p>

      <div class="flex items-center justify-between mt-4">
        <span class="text-lg font-bold text-black">{{ priceCurrent }} €</span>
        <div class="flex items-center space-x-1">
          <button
            type="button"
            @click="decreaseQuantity"
            :disabled="quantity <= 1"
            class="w-8 h-8 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-full flex items-center justify-center focus:ring-gray-100 focus:ring-2 focus:outline-none disabled:opacity-50"
          >
            <svg class="w-4 h-4 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14" />
            </svg>
          </button>
          <input
            type="text"
            v-model="quantity"
            class="w-10 text-center text-gray-900 text-sm border-0 focus:ring-0"
          />
          <button
            type="button"
            @click="increaseQuantity"
            :disabled="quantity >= stock"
            class="w-8 h-8 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-full flex items-center justify-center focus:ring-gray-100 focus:ring-2 focus:outline-none disabled:opacity-50"
          >
            <svg class="w-4 h-4 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 5v14m7-7H5" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <div class="flex items-center px-4 py-2 bg-gray-100 border-t space-x-2">
      <a 
        href="#"
        @click.prevent="addToCart"
        class="w-full flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-secondary focus:outline-none focus:ring-4 focus:ring-blue-300"
      >
        Ajouter au panier
      </a>
    </div>

    <div 
      v-if="isModalOpen" 
      class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
    >
      <div class="bg-white p-6 rounded shadow-lg w-96 relative">
        <h2 class="text-lg font-semibold mb-4 text-red-500">Quantité indisponible</h2>
        <p class="text-gray-700 mb-6">
          Nous ne possédons que <span class="font-bold">{{ props.stock }}</span> fois ce produit. Veuillez ajuster votre demande.
        </p>
        <div class="flex justify-end">
          <button 
            @click="closeModal" 
            class="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useCartStore } from '@/stores/cartStore';
import axios from 'axios';

const props = defineProps({
  sku: String,
  title: String,
  imageSrc: String,
  imageAlt: { type: String, default: 'Game Image' },
  description: String,
  priceCurrent: Number,
  platformName: String,
  edition: String,
  stock: Number,
});

const quantity = ref(1);
const isModalOpen = ref(false);
const cartStore = useCartStore();

const truncatedDescription = computed(() => {
  return props.description.length > 37
    ? props.description.substring(0, 37) + '...'
    : props.description;
});

const increaseQuantity = () => {
  if (quantity.value < props.stock) {
    quantity.value++;
  }
};

const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--;
  }
};

const openModal = () => {
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};

const addToCart = async () => {
  if (quantity.value > props.stock) {
    alert("Quantité demandée indisponible.");
    return;
  }

  try {
    const token = localStorage.getItem('authToken');
    console.log('Token:', token);

    if (token) {
      const response = await axios.post(
        'http://localhost:8080/cart/add', 
        {
          sku: props.sku,
          title: props.title,
          imageSrc: props.imageSrc,
          price: props.priceCurrent,
          quantity: quantity.value,
          stock: props.stock,
          edition: props.edition,
          platform: props.platformName,
          authToken: token, 
        }
      );

      alert('Produit ajouté au panier');
      console.log('Réponse du serveur:', response.data); 
    } else {
      cartStore.addItem({
        sku: props.sku,
        title: props.title,
        imageSrc: props.imageSrc,
        price: props.priceCurrent,
        quantity: quantity.value,
        stock: props.stock,
        edition: props.edition,
        platform: props.platformName,
      });
    }
  } catch (error) {
    alert('Erreur lors de l’ajout au panier');
    console.error('Erreur ajout au panier:', error.response ? error.response.data : error.message);
  }
};
</script>
