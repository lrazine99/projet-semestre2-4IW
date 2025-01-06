<template>
    <div class="mx-8 mt-20">
        <TitleComponent titleText="Liste des produits" />
        <div class="flex justify-center mb-4">
        <button @click="showModalProduct = true" class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
            Ajouter un produit
        </button>
        </div>

        <DataTable v-if="!isLoading" :columns="productColumns" :dataAll="products" :totalPages="totalPages"
        :handleAddProduct="handleAddProduct" :actionsButtons="actionsButtons" 
        @action-click="handleAction" @handleDeleteSelected="handleDeleteSelected" />
        
        <DeleteModal v-if="showDeleteModal" 
        :deleteFunction="deleteFunction"
        :itemsToDelete="itemsToDelete"
        @close="showDeleteModal = false" />
    </div>

    <ModalComponent v-if="showModalProduct" :visible="showModalProduct" title="Ajouter un produit" 
        @close="showModalProduct = false">
        <FormCreateProductComponent :handleSubmit="handleAddProduct" />
    </ModalComponent>

    <ModalComponent v-if="showModalEditProduct" :visible="showModalEditProduct" title="Modifier un produit" 
    @close="showModalEditProduct = false">
      <FormUpdateProductComponent 
        :handleSubmit="handleUpdateProduct" 
        :fields="productFields" 
        :initialValues="selectedProduct"
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
import FormCreateProductComponent from '@/components/forms/FormCreateProductComponent.vue';
import FormUpdateProductComponent from '@/components/forms/FormUpdateProductComponent.vue';

const showModalProduct = ref(false);
const showModalEditProduct = ref(false);
const showDeleteModal = ref(false);
const itemsToDelete = ref([]);
const selectedProductId = ref(null);
const selectedProduct = ref(null);
const products = ref(null);
const isLoading = ref(true);
const totalPages = ref(0);

const productColumns = [
  { key: "name", label: "Nom du produit" },
  { key: "description", label: "Description" },
  { key: "genres", label: "Genres" },
  { key: "minAge", label: "Âge Minimum" },
  { key: "editor", label: "Editeur" },
];

const actionsButtons = [
  { key: "edit", label: "Modifier", bgColor: 'blue', handler: 'editProduct' },
  { key: "delete", label: "Supprimer", bgColor: 'red', handler: 'deleteProduct' },
];

onMounted(async () => {
  try {
    const response = await axios.get(`${VITE_API_ENDPOINT}/product`);
    products.value = [...response.data.productsFound];
    totalPages.value = response.data.totalPages;
  } catch (error) {
    console.error("Erreur lors de la récupération des produits :", error);
  }
  isLoading.value = false;
});

const actionFunctions = {
  editProduct: (productId) => {
    console.log("productId", productId)
    const productToEdit = products.value.find(product => product._id === productId);
    selectedProduct.value = productToEdit; // Stockage du produit sélectionné
    console.log("selectedProduct.value", selectedProduct.value)

    showModalEditProduct.value = true;
  },
  deleteProduct: (productId) => {
    selectedProductId.value = productId;
    itemsToDelete.value = [productId];
    showDeleteModal.value = true;
  },
};

const handleAction = (action, productId) => {
  actionFunctions[action](productId);
};

const handleDeleteSelected = async (rows) => {
  itemsToDelete.value = rows; 
  showDeleteModal.value = true;
};

const deleteFunction = async () => {
  try {
    const deletePromises = itemsToDelete.value.map(id => 
      axios.delete(`${VITE_API_ENDPOINT}/product/${id}`)
    );
    await Promise.all(deletePromises);

    products.value = products.value.filter(product => !itemsToDelete.value.includes(product._id));
    showDeleteModal.value = false;
  } catch (error) {
    console.error('Erreur lors de la suppression des produits :', error);
    alert('Une erreur est survenue lors de la suppression des produits.');
  }
};

const handleAddProduct = async (productData) => {
  try {
    const formattedProductData = {
      name: productData.name,
      description: productData.description,
      genres: productData.genres,
      minAge: productData.minAge,
      editor: productData.editor,
      variants: productData.variants.map(variant => ({
        platform: variant.platform,
        name: variant.name,
        edition: variant.edition,
        price: variant.price,
        stock: variant.stock,
        releaseDate: variant.releaseDate,
        barcode: variant.barcode,
        images: variant.images
      })),
    };

    const response = await axios.post(`${VITE_API_ENDPOINT}/product`, formattedProductData);
    products.value.push(response.data.product);
    showModalProduct.value = false;
  } catch (error) {
    console.error('Erreur lors de l\'ajout du produit :', error);
    alert('Une erreur est survenue lors de l\'ajout du produit.');
  }
};

const handleUpdateProduct = async (productData) => {
  try {
    const formattedProductData = {
      name: productData.name,
      description: productData.description,
      genres: productData.genres,
      minAge: productData.minAge,
      editor: productData.editor,
    };

    const response = await axios.put(`${VITE_API_ENDPOINT}/product/${selectedProduct.value._id}`, formattedProductData);
    const index = products.value.findIndex(product => product._id === selectedProduct.value._id);
    products.value[index] = response.data.product;
    showModalEditProduct.value = false;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du produit :', error);
    alert('Une erreur est survenue lors de la mise à jour du produit.');
  }
};
</script>
