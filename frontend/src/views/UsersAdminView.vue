<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="mx-8 mt-20">
    <TitleComponent titleText="Liste des utilisateurs" />
    <div class="flex justify-center mb-4">

      <button @click="showModalUser = true" class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
        Ajouter un utilisateur
      </button>
    </div>
    <DataTable v-if="!isLoading" :columns="userColumns" :dataAll="users" :totalPages="totalPages" :handleAddUser="handleAddUser"
      :actionsButtons="actionsButtons" @action-click="handleAction" @handleDeleteSelected="handleDeleteSelected" />
  </div>

  <!-- Modal to add a user -->
  <ModalComponent v-if="showModalUser" :visible="showModalUser" title="Ajouter un utilisateur"
    @close="showModalUser = false">
    <FormCreateUserComponent :handleSubmit="handleAddUser" />
  </ModalComponent>


  <!-- Modal to edit a user 
  <ModalComponent v-if="showModalUser" :visible="showModalUser" title="Modifier un utilisateur"
    @close="showModalUser = false">
    <FormCreateUserComponent :handleSubmit="handleAddUser" />
  </ModalComponent>
  -->
</template>


<script setup>
import { onMounted, ref } from 'vue';
import DataTable from '@/components/DataTable.vue';
import axios from 'axios';
import { VITE_API_ENDPOINT } from '@/utils/const';
import ModalComponent from '@/components/ModalComponent.vue';

import DeleteModal from "@/components/DeleteModalComponent.vue";
import TitleComponent from '@/components/TitleComponent.vue';
import FormCreateUserComponent from '@/components/forms/FormCreateUserComponent.vue';

const showModalUser = ref(false);
const users = ref(null);
const isLoading = ref(true);
const totalPages = ref(0);

const userColumns = [
  { key: "firstName", label: "Prénom" },
  { key: "lastName", label: "Nom" },
  { key: "email", label: "Email" },
  { key: "role", label: "Rôle" },
  { key: "birthDate", label: "Date de naissance" },
];

const actionsButtons = [
  { key: "edit", label: "Modifier", bgColor: 'blue', handler: 'editUser' },
  { key: "delete", label: "Supprimer", bgColor: 'red', handler: 'deleteUser' },
  { key: "reset", label: "Réinitialiser le mot de passe", bgColor: 'blue', handler: 'sendResetEmail' },
];


onMounted(async () => {
  try {
    const response = await axios.get(`${VITE_API_ENDPOINT}/user`);

    users.value = [...response.data.users];
    totalPages.value = response.data.totalPages;
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs :", error);
    alert(error.response?.data?.message || "Une erreur est survenue lors de la récupération des utilisateurs.");
  }
  isLoading.value = false;
});


const actionFunctions = {
  editUser: (rowIndex) => {
    console.log('editUser', rowIndex);
  },
  deleteUser: (rowIndex) => {
    console.log('deleteUser', rowIndex);
  },
  sendResetEmail: async (rowIndex) => {
    const email = users.value.find((user) => user._id === rowIndex).email;

    try {
      const response = await fetch(`${VITE_API_ENDPOINT}/user/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      })

      if (response.ok) {
        alert('E-mail de réinitialisation envoyé avec succès.')
      } else {
        console.error("Erreur lors de l'envoi de l'e-mail.")
        alert('Une erreur est survenue, veuillez réessayer.')
      }
    } catch (error) {
      console.error('Erreur réseau:', error)
      alert("Erreur réseau, impossible d'envoyer l'e-mail.")
    }
  }
}

const handleAction = (action, rowIndex) => {
  actionFunctions[action](rowIndex);
}

const handleDeleteSelected = (rows) => {
  console.log('handleDeleteSelected', rows);
}

const handleAddUser = async (formData, signal) => {
  try {
    const response = await axios.post(`${VITE_API_ENDPOINT}/user/admin/add`, formData, { signal })


    if (response.status === 201) {
      await axios.post(`${VITE_API_ENDPOINT}/user/reset-password`, {
        email: formData.email
      })
      alert('Utilisateur ajouté et email envoyé avec succès !')
    }

    users.value.unshift(response.data.user);

    showModalUser.value = false
  } catch (error) {
    console.error("Erreur lors de l'ajout :", error)
    alert(error.response?.data?.message || "Une erreur est survenue lors de l'ajout.")
  }
}


</script>