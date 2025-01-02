<!-- eslint-disable vue/multi-word-component-names -->
<template>
    <div class="mx-8 mt-20">
        <h2 class="text-3xl font-bold mb-4 text-center">Gestion des utilisateurs</h2>
        <DataTable 
            apiEndpoint="http://localhost:8080/user" 
            :columns="userColumns"
            :showResetPassword=true
            :showAddUser=true
        />
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
  