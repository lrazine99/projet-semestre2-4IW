<template>
    <div class="mx-8 mt-20">
      <h2 class="text-3xl font-bold mb-4 text-center">Gestion des produits</h2>
      <DataTable 
        apiEndpoint="http://localhost:8080/product" 
        :columns="productColumns"
        :showAddProduct="true"
        :showProductVariant="true"
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
    ];
    
</script>
