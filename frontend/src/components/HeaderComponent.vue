<template>
  <header class="fixed top-0 z-50 w-full">
    <nav class="bg-white border-gray-200 px-4 lg:px-6 py-2.5">
      <div class="flex flex-wrap justify-between items-center mx-auto max-w-screen-2xl">
        <router-link to="/" class="flex items-center">
          <img
            src="https://flowbite.com/docs/images/logo.svg"
            class="mr-3 h-6 sm:h-9"
            alt="GameMarket logo"
          />
          <span class="self-center text-xl font-semibold whitespace-nowrap">GameMarket</span>
        </router-link>

        <div class="flex items-center lg:order-2 space-x-4">
          <div class="relative">
            <router-link to="/cart" class="relative">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="mr-2 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <span
                v-if="cartItemCount > 0"
                class="absolute top-0 right-0 inline-block w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full text-center"
              >
                {{ cartItemCount }}
              </span>
            </router-link>
          </div>

          <div v-if="isAuthenticated" class="flex items-center space-x-4">
            <router-link to="/cart" class="text-gray-700 hover:text-primary">
              <font-awesome-icon icon="shopping-cart" class="h-6 w-6" />
            </router-link>
            <router-link to="/mon-compte" class="text-gray-700 hover:text-primary">
              <font-awesome-icon icon="user" class="h-6 w-6" />compte
            </router-link>
            <ButtonComponent
              hover-bg-color="hover:bg-secondary"
              to="/logout"
              v-if="isAuthenticated"
              @click="logout"
            >
              Déconnexion
            </ButtonComponent>
          </div>

          <div v-if="!isAuthenticated" class="flex items-center space-x-4">
            <ButtonComponent
              textColor="text-tertiary"
              bgColor="bg-transparent"
              hoverTextColor="hover:text-primary"
              to="/inscription-connexion/#connexion"
            >
              Connexion
            </ButtonComponent>
            <ButtonComponent
              hover-bg-color="hover:bg-secondary"
              to="/inscription-connexion/#inscription"
            >
              Inscription
            </ButtonComponent>
          </div>
        </div>
        <div
          class="hidden justify-between items-center w-full lg:flex lg:w-auto lg:order-1"
          id="mobile-menu-2"
        >
          <ul class="flex flex-col mt-4 font-medium lg:flex-row lg:space-x-8 lg:mt-0">
            <li>
              <router-link to="/" class="block py-2 pr-4 pl-3 text-tertiary hover:text-primary">
                Accueil
              </router-link>
            </li>
            <li>
              <router-link to="/product" class="block py-2 pr-4 pl-3 text-tertiary hover:text-primary">
                Produits
              </router-link>
            </li>
            <li>
              <router-link to="/about" class="block py-2 pr-4 pl-3 text-tertiary hover:text-primary">
                Histoire
              </router-link>
            </li>
            <li>
              <router-link to="/contact" class="block py-2 pr-4 pl-3 text-tertiary hover:text-primary">
                Contact
              </router-link>
            </li>
            <li v-if="isAuthenticated">
              <router-link to="/wishlist" class="block py-2 pr-4 pl-3 text-tertiary hover:text-primary">
                Wishlist
              </router-link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  </header>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useCartStore } from '@/stores/cartStore';
import ButtonComponent from './ButtonComponent.vue';
import { useRouter } from 'vue-router';
import { isUserLoggedIn } from '@/utils/auth';

const isAuthenticated = ref(isUserLoggedIn());

onMounted(() => {
  window.addEventListener('auth-changed', () => {
    isAuthenticated.value = isUserLoggedIn();
  });
});

const router = useRouter();
const logout = () => {
  localStorage.removeItem('authToken');
  isAuthenticated.value = false;
  window.dispatchEvent(new Event('auth-changed'));
  router.push('/inscription-connexion/#connexion');
};

const cartStore = useCartStore();
const cartItemCount = computed(() => cartStore.totalQuantity);
</script>

