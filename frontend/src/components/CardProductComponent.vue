<template>
  <div class="bg-white shadow-lg rounded-lg overflow-hidden w-80 mx-auto cursor-pointer mb-8">
    <div class="relative w-full h-96">
      <img :src="imageSrc" :alt="imageAlt" class="w-full h-full object-fill" />
    </div>

    <div class="p-4">
      <h3 class="text-xl font-semibold text-gray-900">{{ title }} - <span class="text-sm text-gray-600">{{ edition }}</span></h3>
      <p class="text-sm text-gray-500 mt-1">{{ platformName }}</p>
      <p class="text-gray-700 mt-2">{{ truncatedDescription }}</p>

      <!-- Prix et quantité -->
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
            :disabled="quantity >= productQuantity"
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
      <!-- Bouton Wishlist -->
      <a 
        href="#" 
        class="w-1/5 flex items-center justify-center rounded-md bg-red-500 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-red-400 focus:outline-none focus:ring-4 focus:ring-blue-300"
        @click="toggleWishlist"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 21c-.4 0-.8-.2-1.1-.5l-4.4-4.6c-2.5-2.7-3.8-4.4-3.8-7.1C2.7 6.7 5.5 4 8.6 4c1.9 0 3.6 1 4.4 2.6C13.8 5 15.5 4 17.4 4c3.1 0 5.9 2.7 5.9 5.9 0 2.7-1.3 4.4-3.8 7.1l-4.4 4.6c-.3.3-.7.5-1.1.5z" />
        </svg>
      </a>

      <!-- Bouton Panier -->
      <a 
        href="#" 
        class="w-4/5 flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-secondary focus:outline-none focus:ring-4 focus:ring-blue-300"
        @click="checkAndAddToCart"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="mr-2 h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        Ajouter au panier
      </a>
    </div>

    <!-- Modale d'erreur -->
    <div v-if="showErrorModal" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div class="bg-white p-6 rounded-md shadow-md">
        <h3 class="text-xl font-semibold text-red-500">Quantité non disponible</h3>
        <p class="mt-2">La quantité demandée dépasse la quantité disponible. <br>Quantité disponible: {{ productQuantity }}</p>
        <button @click="closeErrorModal" class="mt-4 px-4 py-2 bg-primary hover:bg-secondary text-white rounded-md">Fermer</button>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    title: String,
    imageSrc: String,
    imageAlt: { type: String, default: "Game Image" },
    description: String,
    priceCurrent: Number,
    platformName: String,
    edition: String,
    productQuantity: Number,
  },
  data() {
    return {
      quantity: 1,
      isInWishlist: false,
      showErrorModal: false,
    };
  },
  computed: {
    truncatedDescription() {
      return this.description.length > 37 
        ? this.description.substring(0, 37) + '...' 
        : this.description;
    },
  },
  methods: {
    toggleWishlist() {
      this.isInWishlist = !this.isInWishlist;
      console.log(`${this.isInWishlist ? 'Ajouté' : 'Retiré'} de la wishlist: ${this.title}`);
    },
    checkAndAddToCart() {
      if (this.quantity > this.productQuantity) {
        this.showErrorModal = true;
      } else {
        console.log(`Ajouté au panier: ${this.title}, Quantité: ${this.quantity}`);
      }
    },
    increaseQuantity() {
      if (this.quantity < this.productQuantity) {
        this.quantity++;
      }
    },
    decreaseQuantity() {
      if (this.quantity > 1) {
        this.quantity--;
      }
    },
    closeErrorModal() {
      this.showErrorModal = false;
    },
  },
};
</script>
