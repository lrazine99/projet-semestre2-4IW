<template>
    <LoaderComponent :isVisible="isLoading"/>
      <div class="mx-8 mt-20">
          <TitleComponent titleText="Liste des commandes" />
          <div class="flex justify-center mb-4">
          <button @click="showModalOrder = true" class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
              Créer une commande
          </button>
          </div>
  
          <DataTable v-if="!isLoading" :columns="orderColumns" :dataAll="orders" :totalPages="totalPages"
          :handleAddOrder="handleAddOrder" :actionsButtons="actionsButtons" 
          @action-click="handleAction" @handleDeleteSelected="handleDeleteSelected" />
          
          <DeleteModal v-if="showDeleteModal" 
          :deleteFunction="deleteFunction"
          :itemsToDelete="itemsToDelete"
          @close="showDeleteModal = false" />
      </div>
  
      <ModalComponent v-if="showModalOrder" :visible="showModalOrder" title="Créer une commande" 
          @close="showModalOrder = false">
          <FormCreateOrderComponent :handleSubmit="handleAddOrder" />
      </ModalComponent>
  
      <ModalComponent v-if="showModalEditOrder" :visible="showModalEditOrder" title="Modifier une commande" 
      @close="showModalEditOrder = false">
        <FormUpdateOrderComponent 
          :handleSubmit="handleUpdateOrder" 
          :fields="orderFields" 
          :initialValues="selectedOrder"
        />
      </ModalComponent>
</template>
<script setup>
import { onMounted, ref } from 'vue';
import DataTable from '@/components/DataTable.vue';
import axios from 'axios';
import { VITE_API_ENDPOINT } from '@/utils/const';
import ModalComponent from '@/components/ModalComponent.vue';
import DeleteModal from '@/components/DeleteModalComponent.vue';
import TitleComponent from '@/components/TitleComponent.vue';
/* import FormCreateOrderComponent from '@/components/forms/FormCreateOrderComponent.vue';
import FormUpdateOrderComponent from '@/components/forms/FormUpdateOrderComponent.vue'; */

const showModalOrder = ref(false);
const showModalEditOrder = ref(false);
const showDeleteModal = ref(false);
const itemsToDelete = ref([]);
const selectedOrderId = ref(null);
const selectedOrder = ref(null);
const orders = ref(null);
const isLoading = ref(true);
const totalPages = ref(0);

const orderColumns = [
  { key: "invoiceNumber", label: "Numéro de la commande" },
  { key: "buyer", label: "Nom de l'acheteur" },
  { key: "total", label: "Prix total" },
  { key: "orderAt", label: "Date de la commande" },
  { key: "orderStatus", label: "Statut de la commande" },
  { key: "paymentStatus", label: "Statut du paiement" },
];

const actionsButtons = [
  { key: "edit", label: "Modifier", bgColor: 'blue', handler: 'editOrder' },
  { key: "delete", label: "Supprimer", bgColor: 'red', handler: 'deleteOrder' },
];

onMounted(async () => {
  try {
    const response = await axios.get(`${VITE_API_ENDPOINT}/order`);
    console.log(response);

    // Affecter les données directement si elles sont dans un tableau
    orders.value = response.data;
    
    // Gérer le nombre de pages si nécessaire (vous pouvez le définir manuellement si non fourni)
    totalPages.value = Math.ceil(orders.value.length / 10); // Exemple pour 10 commandes par page
  } catch (error) {
    console.error("Erreur lors de la récupération des commandes :", error);
    orders.value = [];
  }
  isLoading.value = false;
});



</script>