<template>
  <header class="sticky top-0 z-50">
    <nav class="bg-white border-gray-200 px-4 lg:px-6 py-2.5">
      <div class="flex flex-wrap justify-between items-center mx-auto max-w-screen-2xl">
        <a href="/" class="flex items-center">
          <img
            src="https://flowbite.com/docs/images/logo.svg"
            class="mr-3 h-6 sm:h-9"
            alt="GameMarket logo"
          />
          <span class="self-center text-xl font-semibold whitespace-nowrap">GameMarket</span>
        </a>
        <div class="flex items-center lg:order-2">
          <div v-if="isAuthenticated" class="flex items-center space-x-4">
            <a href="/cart" class="text-gray-700 hover:text-primary">
              <font-awesome-icon icon="shopping-cart" class="h-6 w-6" />
            </a>
            <a href="/mon-compte" class="text-gray-700 hover:text-primary">
              <font-awesome-icon icon="user" class="h-6 w-6" />compte
            </a>
            <ButtonComponent
              hover-bg-color="hover:bg-secondary"
              to="/logout"
              v-if="isAuthenticated"
              @click="logout"
            >
              Déconnexion
            </ButtonComponent>
          </div>
          <div v-if="!isAuthenticated">
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
              <a href="/" class="block py-2 pr-4 pl-3 text-tertiary hover:text-primary">Accueil</a>
            </li>
            <li>
              <a href="/products" class="block py-2 pr-4 pl-3 text-tertiary hover:text-primary"
                >Produits</a
              >
            </li>
            <li>
              <a href="/about" class="block py-2 pr-4 pl-3 text-tertiary hover:text-primary"
                >Histoire</a
              >
            </li>
            <li>
              <a href="/contact" class="block py-2 pr-4 pl-3 text-tertiary hover:text-primary"
                >Contact</a
              >
            </li>
            <li v-if="isAuthenticated">
              <a href="/wishlist" class="block py-2 pr-4 pl-3 text-tertiary hover:text-primary"
                >Wishlist</a
              >
            </li>
          </ul>
        </div>
      </div>
    </nav>
  </header>
</template>

<script setup>
import ButtonComponent from './ButtonComponent.vue'

const isAuthenticated = localStorage.getItem('authToken')

const logout = () => {
  localStorage.removeItem('authToken')
  window.location.reload();
}
</script>
