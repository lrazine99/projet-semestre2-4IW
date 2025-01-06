<template>
  <LoaderComponent :isVisible="isLoading"/>
  <div class="mx-8 mt-20">
      <TitleComponent titleText="Liste des commandes" />
      <div class="flex justify-center mb-4">
          <button @click="showModalOrder = true" class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
              Créer une commande
          </button>
      </div>

      <DataTable 
          v-if="!isLoading" 
          :columns="orderColumns" 
          :dataAll="orders" 
          :totalPages="totalPages"
          :handleAddOrder="handleAddOrder" 
          :actionsButtons="actionsButtons" 
          @action-click="handleAction" 
          @handleDeleteSelected="handleDeleteSelected" 
      />
        
      <DeleteModal 
          v-if="showDeleteModal" 
          :deleteFunction="deleteFunction"
          :itemsToDelete="itemsToDelete"
          @close="showDeleteModal = false" 
      />

      <ModalComponent 
          v-if="showModalOrder" 
          :visible="showModalOrder" 
          title="Créer une commande" 
          @close="showModalOrder = false"
      >
          <FormCreateOrderComponent :handleSubmit="handleAddOrder" />
      </ModalComponent>

      <ModalComponent 
          v-if="showModalEditOrder" 
          :visible="showModalEditOrder" 
          title="Modifier une commande" 
          @close="showModalEditOrder = false"
      >
          <FormUpdateOrderComponent 
              :handleSubmit="handleUpdateOrder" 
              :initialValues="selectedOrder"
          />
      </ModalComponent>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import DataTable from '@/components/DataTable.vue';
import axios from 'axios';
import { VITE_API_ENDPOINT } from '@/utils/const';
import ModalComponent from '@/components/ModalComponent.vue';
import DeleteModal from '@/components/DeleteModalComponent.vue';
import TitleComponent from '@/components/TitleComponent.vue';
import LoaderComponent from '@/components/LoaderComponent.vue';
import FormUpdateOrderComponent from '@/components/forms/FormUpdateOrderComponent.vue';

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
  { key: "buyer", label: "Email de l'acheteur" }, // Mise à jour du label
  { key: "total", label: "Prix total" },
  { key: "orderAt", label: "Date de la commande" },
  { key: "orderStatus", label: "Statut de la commande" },
  { key: "paymentStatus", label: "Statut du paiement" },
];


const actionsButtons = [
  { key: "edit", label: "Modifier", bgColor: 'blue', handler: 'editOrder' },
  { key: "delete", label: "Supprimer", bgColor: 'red', handler: 'deleteOrder' },
];
const statusTranslations = {
  orderStatus: {
    PENDING: "En attente",
    CONFIRMED: "Confirmée",
    SHIPPED: "Expédiée",
    DELIVERED: "Livrée",
    CANCELLED: "Annulée"
  },
  paymentStatus: {
    PAID: "Payé",
    PENDING: "En attente"
  }
};

const translateStatus = (key, value) => statusTranslations[key]?.[value] || value;

onMounted(async () => {
  try {
    const [ordersResponse, usersResponse] = await Promise.all([
      axios.get(`${VITE_API_ENDPOINT}/order`),
      axios.get(`${VITE_API_ENDPOINT}/user`)
    ]);

    console.log('Réponse utilisateurs :', usersResponse.data);
    console.log('Réponse commandes :', ordersResponse.data);

    const users = usersResponse.data.users || [];
    const usersMap = users.reduce((acc, user) => {
      acc[user._id] = user.email;
      return acc;
    }, {});

    orders.value = ordersResponse.data.map(order => ({
      ...order,
      buyer: usersMap[order.buyer] || 'Utilisateur inconnu', 
      orderStatus: translateStatus('orderStatus', order.orderStatus),
      paymentStatus: translateStatus('paymentStatus', order.paymentStatus)
    }));

    totalPages.value = Math.ceil(orders.value.length / 10);
  } catch (error) {
    console.error("Erreur lors de la récupération des commandes ou des utilisateurs :", error);
    orders.value = [];
  }
  isLoading.value = false;
});





const actionFunctions = {
  editOrder: (orderId) => {
  const orderToEdit = orders.value.find(order => order._id === orderId);
  if (orderToEdit) {
    selectedOrder.value = {
      ...orderToEdit,
      orderAt: new Date(orderToEdit.orderAt).toISOString().slice(0, 16), // Format pour datetime-local
      orderStatus: Object.keys(statusTranslations.orderStatus).find(
        key => statusTranslations.orderStatus[key] === orderToEdit.orderStatus
      ),
      paymentStatus: Object.keys(statusTranslations.paymentStatus).find(
        key => statusTranslations.paymentStatus[key] === orderToEdit.paymentStatus
      )
    };
    showModalEditOrder.value = true;
  }
},
  deleteOrder: (orderId) => {
      selectedOrderId.value = orderId;
      itemsToDelete.value = [orderId];
      showDeleteModal.value = true;
  }
};

const handleAction = (action, orderId) => {
  actionFunctions[action](orderId);
};

const handleDeleteSelected = async (rows) => {
  itemsToDelete.value = rows;
  showDeleteModal.value = true;
};

const deleteFunction = async () => {
  try {
      const deletePromises = itemsToDelete.value.map(id => 
          axios.delete(`${VITE_API_ENDPOINT}/order/${id}`)
      );
      await Promise.all(deletePromises);

      orders.value = orders.value.filter(order => !itemsToDelete.value.includes(order._id));
      showDeleteModal.value = false;
  } catch (error) {
      console.error('Erreur lors de la suppression des commandes :', error);
      alert('Une erreur est survenue lors de la suppression des commandes.');
  }
};

const handleUpdateOrder = async (orderData) => {
  try {
    const formattedOrderData = {
      invoiceNumber: orderData.invoiceNumber,
      buyer: orderData.buyer,
      total: Number(orderData.total),
      orderAt: orderData.orderAt,
      orderStatus: orderData.orderStatus,
      paymentStatus: orderData.paymentStatus 
    };

    const response = await axios.put(
      `${VITE_API_ENDPOINT}/order/${selectedOrder.value._id}`,
      formattedOrderData
    );

    orders.value = orders.value.map(order =>
      order._id === selectedOrder.value._id
        ? {
            ...response.data.order,
            orderStatus: translateStatus('orderStatus', response.data.order.orderStatus),
            paymentStatus: translateStatus('paymentStatus', response.data.order.paymentStatus)
          }
        : order
    );

    showModalEditOrder.value = false;
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la commande :', error);
    alert('Une erreur est survenue lors de la mise à jour de la commande.');
  }
};

</script>