<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <BannerComponent
  titre="Bienvenue sur GameMarket"
  paragraphe="Découvrez nos jeux vidéo, plus de 1000 produits, pour toutes plateformes !"
  btnText="Découvrir maintenant"
  />
  <div class="container mx-auto p-6">    
    <IdentityComponent 
    />
    <ProductList :limit="8" />
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import ProductList from '../components/ProductList.vue';
import BannerComponent from '../components/BannerComponent.vue';
import IdentityComponent from '../components/IdentityComponent.vue';


export default defineComponent({
  components: {
    BannerComponent,
    IdentityComponent,
    ProductList,
  },
});
</script>