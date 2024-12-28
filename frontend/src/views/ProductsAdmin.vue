<template>
    <div class="m-8">
      <h2 class="text-2xl font-bold mb-4">Gestion des produits</h2>
      <DataTable 
        apiEndpoint="http://localhost:8080/product" 
        :columns="productColumns"
        :showResetPassword="false"
        :showAddUser="false"
        :showAddProduct="true"
      />
    </div>
  </template>
  

<script setup>
    import DataTable from '../components/DataTable.vue';

    const productColumns = [
        { key: "name", label: "Nom du produit" },
        { key: "description", label: "Description" },
        { key: "genres", label: "Genres" },
        { key: "minAge", label: "Âge minimum" },
        { key: "editor", label: "Éditeur" },
        /* { key: "variantName", label: "Nom de la variante" },
        { key: "variantEdition", label: "Édition de la variante" },
        { key: "variantPrice", label: "Prix" },
        { key: "variantStock", label: "Stock" },
        { key: "platform", label: "Plateforme" }, */
    ];
    
</script>
