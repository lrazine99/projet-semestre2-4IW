<template>
    <LoaderComponent :isVisible="isLoading" />
    <div class="mx-8 mt-20">
        <TitleComponent :titleText="`Détails de la commande ${order?.invoiceNumber || ''}`" />
        <button @click="goBack" class="flex items-center text-blue-500 hover:text-blue-600">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            Retour aux commandes
        </button>
        <div class="flex justify-center mb-4">
            <button @click="showModalAddProductOrder = true"
                class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
                Ajouter un produit à la commande
            </button>
        </div>
        <DataTable v-if="!isLoading" :columns="productColumns" :dataAll="products" :actionsButtons="actionsButtons"
            @action-click="handleAction" :totalPages="totalPages" />
        <DeleteModal v-if="showDeleteModal" :deleteFunction="deleteFunction" :itemsToDelete="itemsToDelete"
            @close="showDeleteModal = false" />
    </div>
    <ModalComponent v-if="showModalEditQuantity" :visible="showModalEditQuantity" title="Modifier la quantité"
        @close="showModalEditQuantity = false">
        <FormUpdateQuantityProductOrder :handleSubmit="handleUpdateQuantity"
            :initialValues="{ quantity: selectedProduct?.quantity }" />
    </ModalComponent>
    <ModalComponent v-if="showModalAddProductOrder" :visible="showModalAddProductOrder" title="Ajouter un produit"
        @close="showModalAddProductOrder = false">
        <FormAddProductOrder :handleSubmit="handleAddProduct" />
    </ModalComponent>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import LoaderComponent from '@/components/LoaderComponent.vue';
import ModalComponent from '@/components/ModalComponent.vue';
import TitleComponent from '@/components/TitleComponent.vue';
import DataTable from '@/components/DataTable.vue';
import DeleteModal from "@/components/DeleteModalComponent.vue";
import { VITE_API_ENDPOINT } from '@/utils/const';
import FormUpdateQuantityProductOrder from '@/components/forms/FormUpdateQuantityProductOrder.vue';
import FormAddProductOrder from '@/components/forms/FormAddProductOrder.vue';

const route = useRoute();
const router = useRouter();
const orderId = route.params.id;
const isLoading = ref(true);
const products = ref([]);
const order = ref(null);
const showDeleteModal = ref(false);
const showModalEditQuantity = ref(false);
const showModalAddProductOrder = ref(false);
const itemsToDelete = ref(null);
const selectedProduct = ref(null);
const totalPages = ref(0);

const goBack = () => {
  router.push({ name: 'OrdersAdmin' }); 
};

const productColumns = [
    { key: 'name', label: 'Nom du produit' },
    { key: 'variantName', label: 'Nom de la variante' },
    { key: 'platform', label: 'Plateforme' },
    { key: 'quantity', label: 'Quantité' },
    { key: 'price', label: 'Prix unitaire' },
];

const actionsButtons = [
    { key: "edit", label: "Modifier", bgColor: 'blue', handler: 'editOrder' },
    { key: "delete", label: "Supprimer", bgColor: 'red', handler: 'deleteProduct' },
];

const actionFunctions = {
    editOrder: (product) => {
        console.log('Selected product:', product);
        selectedProduct.value = product;
        showModalEditQuantity.value = true;
    },
    deleteProduct: (product) => {
        itemsToDelete.value = product.productSku;
        showDeleteModal.value = true;
    }
};

const deleteFunction = async () => {
    console.log(itemsToDelete.value)
    try {
        await axios.delete(`${VITE_API_ENDPOINT}/order/${orderId}/product/${itemsToDelete.value}`);
        products.value = products.value.filter(product => product.productSku !== itemsToDelete.value);
        console.log(products.value)
        showDeleteModal.value = false;
    } catch (error) {
        console.error("Erreur lors de la suppression du produit :", error);
        alert("Une erreur est survenue lors de la suppression du produit.");
    }
};

const handleAction = (action, productId) => {
    const actionFunction = actionFunctions[action];
    if (actionFunction) {
        const product = products.value.find(p => p._id === productId);
        if (product) {
            actionFunction(product);
        }
    }
};


const getVariantDetails = async (productSku) => {
    try {
        const response = await axios.get(`${VITE_API_ENDPOINT}/product/variant/${productSku}`);
        console.log(response)
        return response.data;
    } catch (error) {
        console.error(`Erreur lors de la récupération de la variante pour le SKU ${productSku}:`, error);
        return null;
    }
};

onMounted(async () => {
    try {
        const response = await axios.get(`${VITE_API_ENDPOINT}/order/${orderId}/details`);
        console.log("OrderResponse", response);
        order.value = response.data;

        const productDetails = await Promise.all(order.value.products.map(async (product) => {
            const variantDetails = await getVariantDetails(product.productSku);
            return {
                _id: product.productSku,
                name: variantDetails?.product?.name || 'N/A',
                variantName: variantDetails?.product?.variant?.name || 'N/A',
                platform: variantDetails?.platforms?.find(p => p._id === variantDetails?.product?.variant?.platform)?.name || 'N/A',
                quantity: product.quantity,
                price: product.price,
                productSku: product.productSku
            };
        }));

        totalPages.value = response.data.totalPages;
        products.value = productDetails;
    } catch (error) {
        console.error('Erreur lors de la récupération des détails de la commande :', error);
    }
    isLoading.value = false;
});
const handleUpdateQuantity = async (formData) => {
    try {
        const parsedQuantity = parseInt(formData.quantity);
        const response = await axios.put(
            `${VITE_API_ENDPOINT}/order/${orderId}/product/${selectedProduct.value.productSku}`,
            { quantity: parsedQuantity }
        );

        products.value = products.value.map(product =>
            product.productSku === selectedProduct.value.productSku
                ? { ...product, quantity: parsedQuantity }
                : product
        );

        showModalEditQuantity.value = false;
    } catch (error) {
        console.error('Erreur lors de la mise à jour de la quantité:', error);
        alert('Une erreur est survenue lors de la mise à jour.');
    }
};
const handleAddProduct = async (formData) => {
    try {
        const response = await axios.post(
            `${VITE_API_ENDPOINT}/order/${orderId}/product`,
            {
                productSku: formData.productVariant,
                quantity: formData.quantity
            }
        );

        const newProduct = await getVariantDetails(formData.productVariant);
        products.value.push({
            _id: response.data.productId,
            name: newProduct?.product?.name,
            variantName: newProduct?.product?.variant?.name,
            platform: newProduct?.platforms?.find(p => p._id === newProduct?.product?.variant?.platform)?.name,
            quantity: formData.quantity,
            price: newProduct?.product?.variant?.price,
            productSku: formData.productVariant
        });

        showModalAddProductOrder.value = false;
    } catch (error) {
        console.error('Erreur lors de l\'ajout du produit:', error);
        alert('Une erreur est survenue lors de l\'ajout.');
    }
};
</script>