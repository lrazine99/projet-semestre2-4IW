<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <BannerComponent
  titre="Bienvenue sur GameMarket"
  paragraphe="Découvrez nos jeux vidéo, plus de 1000 produits, pour toutes plateformes !"
  btnText="Découvrir maintenant"
  class="mb-16"
  />
  <div class="container mx-auto p-6">    
    <section class="mb-8">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <CardProductComponent
          title="GTA VI"
          imageSrc="https://placedog.net/250x300"
          imageAlt="Jeu 1"
          description="Après 12 ans d'attente."
          priceCurrent="19.99€"
        />
        <CardProductComponent
          title="Elden Ring"
          imageSrc="https://placedog.net/250x300"
          imageAlt="Jeu 2"
          description="Plongez dans l'action."
          priceCurrent="29.99€"
        />
        <CardProductComponent
          title="Minecraft"
          imageSrc="https://placedog.net/250x300"
          imageAlt="Jeu 3"
          description="Un monde ouvert incroyable."
          priceCurrent="24.99€"
        />
        <CardProductComponent
          title="Mario Bros"
          imageSrc="https://placedog.net/250x300"
          imageAlt="Jeu 4"
          description="Vroum vroum les voitures."
          priceCurrent="14.99€"
        />
      </div>
    </section>

    <section class="mb-16">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <CardProductComponent
          title="Horizon Forbidden West"
          imageSrc="https://placedog.net/250x300"
          imageAlt="Jeu 1"
          description="Explorez de nouveaux horizons dans ce monde post-apocalyptique."
          priceCurrent="29.99€"
        />
        <CardProductComponent
          title="The Legend of Zelda"
          imageSrc="https://placedog.net/250x300"
          imageAlt="Jeu 2"
          description="Vivez une aventure épique dans le royaume d'Hyrule."
          priceCurrent="39.99€"
        />
        <CardProductComponent
          title="Assassin's Creed Valhalla"
          imageSrc="https://placedog.net/250x300"
          imageAlt="Jeu 3"
          description="Incarnez un viking et partez à la conquête de l'Angleterre."
          priceCurrent="34.99€"
        />
        <CardProductComponent
          title="FIFA 23"
          imageSrc="https://placedog.net/250x300"
          imageAlt="Jeu 4"
          description="Devenez le meilleur entraîneur et remportez la coupe."
          priceCurrent="24.99€"
        />
      </div>
    </section>

  </div>
</template>

<script>
import BannerComponent from '../components/BannerComponent.vue';
import CardProductComponent from '../components/CardProductComponent.vue';

export default {
  components: {
    BannerComponent,
    CardProductComponent,
  },
};
</script>
