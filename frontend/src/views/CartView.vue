<!-- eslint-disable vue/multi-word-component-names -->
<!-- eslint-disable vue/no-use-v-if-with-v-for -->
<template>
  <LoaderComponent v-if="cartItems.length === 0" />
  <div class="container mx-auto py-8 px-4 mt-10">
    <TitleComponent titleText="Votre Panier" />
    <div class="flex space-x-8">
      <div class="flex-1 space-y-6">
        <div  v-scroll-appear v-if="cartItems.length > 0" v-for="(item, index) in cartItems" :key="index"
          class="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200 flex items-center space-x-6 p-6 hover:shadow-xl transition-shadow relative">
          <div class="flex-shrink-0">
            <img :src="item.imageSrc" alt="Product Image" class="w-32 h-32 object-cover rounded-lg shadow-md" />
          </div>

          <div class="flex-1">
            <h2 class="text-xl font-semibold text-gray-800">{{ item.title }}</h2>
            <p class="text-sm text-gray-500">{{ item.edition }} - {{ item.platform }}</p>
            <p class="mt-2 text-lg text-gray-700">Prix unitaire : {{ item.price }}€</p>

            <div class="mt-4 flex items-center space-x-6">
              <div class="flex items-center space-x-3">
                <button type="button" @click="decreaseQuantity(index)" :disabled="item.quantity <= 1"
                  class="w-8 h-8 bg-gray-200 hover:bg-gray-300 border border-gray-300 rounded-full flex items-center justify-center focus:ring-gray-100 focus:ring-2 disabled:opacity-50">
                  <svg class="w-4 h-4 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14" />
                  </svg>
                </button>

                <input type="text" v-model="item.quantity"
                  class="w-10 text-center text-gray-900 text-sm border-0 focus:ring-0" />

                <button type="button" @click="increaseQuantity(index)" :disabled="item.quantity >= item.stock"
                  class="w-8 h-8 bg-gray-200 hover:bg-gray-300 border border-gray-300 rounded-full flex items-center justify-center focus:ring-gray-100 focus:ring-2 disabled:opacity-50">
                  <svg class="w-4 h-4 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 5v14m7-7H5" />
                  </svg>
                </button>
              </div>
              <p class="text-lg font-semibold text-gray-900">
                {{ (item.price * item.quantity).toFixed(2) }}€
              </p>
            </div>
          </div>

          <div class="absolute top-2 right-2">
            <button @click="openDeleteModal(index)" class="text-red-600 hover:text-red-800 font-semibold text-xl">
              ×
            </button>
          </div>
        </div>
        <div v-else class="text-center py-12">
          <p class="text-lg text-gray-500">Votre panier est vide.</p>
        </div>
      </div>


      <div v-if="cartItems.length > 0"
        class="w-1/3 bg-white shadow-lg rounded-lg p-6 space-y-6 sticky top-20 self-start">
        <div class="border-b border-gray-200 pb-4">
          <p class="text-2xl font-semibold text-gray-900">Résumé de la commande</p>
          <div class="mt-4 text-gray-600">
            <div class="flex justify-between mb-2">
              <span>Nombre d'articles</span>
              <span>{{ cartItems.length }}</span>
            </div>
            <div class="flex justify-between mb-2">
              <span>Quantité totale</span>
              <span>{{ totalQuantity }}</span>
            </div>
            <div class="flex justify-between mb-2">
              <span class="font-bold">Prix total</span>
              <span class="font-bold">{{ totalPrice }}€</span>
            </div>
          </div>
        </div>

        <div class="mt-6 flex justify-between space-x-4 flex-col md:space-x-0 md:space-y-4">
          <ButtonComponent textColor="text-white" hoverBgColor="hover:bg-secondary" to="/produits">
            Continuer les achats
          </ButtonComponent>
          <ButtonComponent bgColor="bg-green-600" textColor="text-white" hoverBgColor="hover:bg-green-700"
            :to="destination">
            Passer au paiement
          </ButtonComponent>
        </div>
      </div>
    </div>

    <DeleteModal v-if="isDeleteModalOpen" :deleteFunction="confirmDeleteItem" :onSuccess="closeDeleteModal"
      @close="closeDeleteModal" />
  </div>
</template>

<script setup>
import { ref, onBeforeMount, computed } from "vue";
import { useCartStore } from "@/stores/cartStore";
import axios from "axios";
import ButtonComponent from "@/components/ButtonComponent.vue";
import DeleteModal from "@/components/DeleteModalComponent.vue";
import { useLoginStore } from '@/stores/loginStore';
import { VITE_API_ENDPOINT } from "@/utils/const";
import LoaderComponent from "@/components/LoaderComponent.vue";
import TitleComponent from "@/components/TitleComponent.vue";

const loginStore = useLoginStore();

const cartStore = useCartStore();
const cartItems = ref([]);
const totalPrice = computed(() =>
  cartItems.value.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2)
);
const totalQuantity = computed(() =>
  cartItems.value.reduce((total, item) => total + item.quantity, 0)
);
const isDeleteModalOpen = ref(false);
const itemToDeleteIndex = ref(null);



const openDeleteModal = (index) => {
  itemToDeleteIndex.value = index;
  isDeleteModalOpen.value = true;
};

const closeDeleteModal = () => {
  isDeleteModalOpen.value = false;
  itemToDeleteIndex.value = null;
};

const confirmDeleteItem = async () => {
  if (itemToDeleteIndex.value !== null) {
    const item = cartItems.value[itemToDeleteIndex.value];

    if (loginStore.isAuthenticated) {
      const token = loginStore.token;

      try {
        await axios.delete(`${VITE_API_ENDPOINT}/cart/remove/${item.sku}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        cartItems.value.splice(itemToDeleteIndex.value, 1);
      } catch (error) {
        if (error.response.status === 404) {
          cartStore.removeItem(itemToDeleteIndex.value);
          cartItems.value = cartStore.cartItems;
        }

        console.error("Erreur lors de la suppression de l'article :", error);
      }
    } else {
      cartStore.removeItem(itemToDeleteIndex.value);
      cartItems.value = cartStore.cartItems;
    }
    closeDeleteModal();
  }
};


const increaseQuantity = async (index) => {
  const item = cartItems.value[index];

  if (item.quantity < item.stock) {
    if (loginStore.isAuthenticated) {
      const token = loginStore.token;

      try {
        await axios.patch(
          `${VITE_API_ENDPOINT}/cart/increase/${item.sku}`,
          { quantity: item.quantity + 1 },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        item.quantity++;
      } catch (error) {
        console.error("Erreur lors de la mise à jour :", error);
      }
    } else {
      cartStore.increaseItemQuantity(index);
      cartItems.value = cartStore.cartItems;
    }
  }
};


const decreaseQuantity = async (index) => {
  const item = cartItems.value[index];
  if (item.quantity > 1) {
    if (loginStore.isAuthenticated) {
      const token = loginStore.token;

      try {
        await axios.patch(
          `${VITE_API_ENDPOINT}/cart/decrease/${item.sku}`,
          { quantity: item.quantity - 1 },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        item.quantity--;
      } catch (error) {
        console.error("Erreur lors de la mise à jour :", error);
      }
    } else {
      cartStore.decreaseItemQuantity(index);
      cartItems.value = cartStore.cartItems;
    }
  }
};
const destination = loginStore.isAuthenticated ? '/commande' : '/inscription-connexion/#connexion';

onBeforeMount(async () => {
  await cartStore.loadCart();
  cartItems.value = cartStore.cartItems
});
</script>