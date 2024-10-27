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
          <h2 class="mb-6 text-sm font-semibold text-white uppercase">Téléchargements</h2>
          <ul class="font-medium text-center">
            <li class="mb-4">
              <LinkComponent
                to=""
              >
                IOS
              </LinkComponent>
            </li>
            <li class="mb-4">
              <LinkComponent
                to=""
              >
                Android
              </LinkComponent>
            </li>
            <li class="mb-4">
              <LinkComponent
                to=""
              >
                Windows
              </LinkComponent>
            </li>
            <li class="mb-4">
              <LinkComponent
                to=""
              >
                MacOS
              </LinkComponent>
            </li>
          </ul>
        </div>
      </div>
      <div class="px-4 py-6 bg-slate-900 md:flex md:items-center md:justify-between shadow-2xl shadow-gray-500">
        <span class="text-sm text-gray-300 sm:text-center">© 2024 Louafi et Paul. Tous droits réservés.</span>
        <span class="text-sm text-gray-300 sm:text-center">
          <LinkComponent
          to=""
          font-weight="font-light"
          >
          Mentions Légales
          </LinkComponent>
          <span> | </span>
          <LinkComponent
          to=""
          font-weight="font-light"
          >
          Conditions générales de ventes (CGV)
          </LinkComponent>
          <span> | </span>
          <LinkComponent
          to=""
          font-weight="font-light"
          >
          Conditions générales d'utilisations (CGU)
          </LinkComponent>
          <span> | </span>
          <LinkComponent
          to=""
          font-weight="font-light"
          >
          Politique de Confidentialité
          </LinkComponent> 
        </span>
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