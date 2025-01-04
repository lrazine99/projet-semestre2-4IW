<template>
    <div class="mx-8 mt-20">
      <h2 class="text-3xl font-bold mb-4 text-center">Gestion des variantes</h2>
      <DataTable 
        apiEndpoint="http://localhost:8080/product" 
        :columns="productColumns"
        :showProduct="true"
      />
    </div>
  </template>
  

<script setup>
    import DataTable from '../components/DataTableProduct.vue';

    const productColumns = [
        { key: "name", label: "Nom du produit" },
        { key: "description", label: "Description" },
        { key: "genres", label: "Genres" },
        { key: "minAge", label: "Âge minimum" },
        { key: "editor", label: "Éditeur" },
        { key: "variantName", label: "Nom de la variante" },
        { key: "variantEdition", label: "Édition de la variante" },
        { key: "variantPrice", label: "Prix" },
        { key: "variantStock", label: "Stock" },
        { key: "platform", label: "Plateforme" },
        /* { key: "images", label: "Image" }, */
        { key: "barcode", label: "Code Barre" },
    ];   
</script>
