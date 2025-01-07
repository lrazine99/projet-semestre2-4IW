<template>
  <footer class="bg-slate-800 h-[50%]">
    <div class="mx-auto w-full">
      <div class="grid grid-cols-1 gap-8 px-4 py-6 lg:py-8 md:grid-cols-3 justify-center">
        <div class="text-center">
          <h2 class="mb-6 text-sm font-semibold text-white uppercase">Contact</h2>
          <ul class="text-white font-medium text-center">
            <li class="mb-4">
              <LinkComponent
                to="mailto:contact@game-market.com"
              >
                Email : contact@game-market.com
              </LinkComponent>
            </li>
            <li class="mb-4">
              <LinkComponent
                to="tel:+33123456789"
              >
                Téléphone : +33 1 23 45 67 89
              </LinkComponent>
            </li>
          </ul>
        </div>
        <div class="text-center">
          <h2 class="mb-6 text-sm font-semibold text-white uppercase">Liens</h2>
          <ul class="text-white font-medium text-center">
            <li class="mb-4">
              <router-link to="/contact" class="text-white">
                Contact
              </router-link>
            </li>
            <li class="mb-4">
              <router-link to="/faq" class="text-white">
                FAQ
              </router-link>
            </li>
            <li class="mb-4">
              <router-link to="/product" class="text-white">
                Produits
              </router-link>
            </li>
          </ul>
        </div>
        <div class="text-center">
          <h2 class="mb-6 text-sm font-semibold text-white uppercase">Mentions</h2>
          <ul class="font-medium text-center">
            <li class="mb-4">
              <router-link to="/mentions-legales" class="text-white">
                Mentions Légales
              </router-link>
            </li>
            <li class="mb-4">
              <router-link to="/cgv" class="text-white">
                Conditions générales de ventes (CGV)
              </router-link>
            </li>
            <li class="mb-4">
              <router-link to="/cgu" class="text-white">
                Conditions générales d'utilisations (CGU)
              </router-link>
            </li>
            <li class="mb-4">
              <router-link to="/politique-confidentialite" class="text-white">
                Politique de Confidentialité
              </router-link>
            </li>
          </ul>
        </div>
      </div>
      <div class="px-4 py-6 bg-slate-900 md:flex md:items-center md:justify-between shadow-2xl shadow-gray-500">
        <span class="text-sm text-gray-300 sm:text-center">© 2024 Louafi et Paul. Tous droits réservés.</span>
      </div>
    </div>
  </footer>
</template>

<script setup>
import LinkComponent from './LinkComponent.vue';
</script>
