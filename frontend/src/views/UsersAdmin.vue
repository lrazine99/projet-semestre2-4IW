<!-- eslint-disable vue/multi-word-component-names -->
<template>
    <div class="mt-8">
        <h2 class="text-2xl font-bold mb-4">Gestion des utilisateurs</h2>
        <DataTable apiEndpoint="http://localhost:8080/users" :columns="userColumns" />
    </div>
</template>

<script setup>
    import DataTable from '../components/DataTable.vue'; 
    
    const userColumns = [
    { key: "firstName", label: "Prénom" },
    { key: "lastName", label: "Nom" },
    { key: "email", label: "Email" },
    { key: "role", label: "Rôle" },
    { key: "birthDate", label: "Date de naissance" },
    ];
</script>
  