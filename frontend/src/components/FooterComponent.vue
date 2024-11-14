<template>
  <footer class="bg-slate-800	">
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
              <LinkComponent
                to=""
              >
                Contact
              </LinkComponent>
            </li>
            <li class="mb-4">
              <LinkComponent
                to=""
              >
                FAQ
              </LinkComponent>
            </li>
            <li class="mb-4">
              <LinkComponent
                to="product"
              >
                Produits
              </LinkComponent>
            </li>
          </ul>
        </div>
        <div class="text-center">
          <h2 class="mb-6 text-sm font-semibold text-white uppercase">Mentions</h2>
          <ul class="font-medium text-center">
            <li class="mb-4">
              <LinkComponent
              to=""
              >
              Mentions Légales
              </LinkComponent>
            </li>
            <li class="mb-4">
              <LinkComponent
              to=""
              >
              Conditions générales de ventes (CGV)
              </LinkComponent>
            </li>
            <li class="mb-4">
              <LinkComponent
              to=""
              >
              Conditions générales d'utilisations (CGU)
              </LinkComponent>
            </li>
            <li class="mb-4">
              <LinkComponent
              to=""
              >
              Politique de Confidentialité
              </LinkComponent> 
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

<script>
import LinkComponent from './LinkComponent.vue';

export default {
  components: {
    LinkComponent,
  },
};
</script>