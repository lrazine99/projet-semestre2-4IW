<template>
  <!-- Template remains unchanged -->
  <div class="mx-8 mt-20">
    <TitleComponent titleText="Liste des variantes" />
    <div class="flex justify-center mb-4">
      <button
        @click="showModalProductVariant = true"
        class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
      >
        Ajouter une variante
      </button>
    </div>

    <div v-if="isLoading" class="text-center">Chargement des données...</div>
    <div v-else-if="!products.length" class="text-center">
      Aucun produit ou variante disponible.
    </div>
    <DataTable
      v-else
      :columns="productVariantColumns"
      :dataAll="products"
      :totalPages="totalPages"
      :handleAddProductVariant="handleAddProductVariant"
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
  v-if="showModalProductVariant"
  :visible="showModalProductVariant"
  title="Ajouter une variante"
  @close="showModalProductVariant = false"
>
  <FormCreateProductVariantComponent 
    :handleSubmit="handleAddProductVariant"
    @variant-added="onVariantAdded"
  />
</ModalComponent>

    <ModalComponent
  v-if="showModalEditProductVariant"
  :visible="showModalEditProductVariant"
  title="Modifier une variante"
  @close="showModalEditProductVariant = false"
>
  <FormUpdateProductVariantComponent
    :handleSubmit="handleUpdateProductVariant"
    :productId="selectedProductVariant.productId"
    :variantId="selectedProductVariant._id"
    :initialValues="{
      platform: selectedProductVariant.platform,
      name: selectedProductVariant.name,
      edition: selectedProductVariant.edition,
      price: selectedProductVariant.price,
      stock: selectedProductVariant.stock,
      releaseDate: selectedProductVariant.releaseDate,
      barcode: selectedProductVariant.barcode,
      images: selectedProductVariant.images?.[0] || ''
    }"
  />
</ModalComponent>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import axios from 'axios';
import DataTable from '@/components/DataTable.vue';
import ModalComponent from '@/components/ModalComponent.vue';
import DeleteModal from '@/components/DeleteModalComponent.vue';
import TitleComponent from '@/components/TitleComponent.vue';
import { VITE_API_ENDPOINT } from '@/utils/const';
import FormCreateProductVariantComponent from '@/components/forms/FormCreateProductVariantComponent.vue';
import FormUpdateProductVariantComponent from '@/components/forms/FormUpdateProductVariantComponent.vue';

const showModalProductVariant = ref(false);
const showModalEditProductVariant = ref(false);
const showDeleteModal = ref(false);
const itemsToDelete = ref([]);
const selectedProductVariant = ref(null);
const products = ref([]);
const isLoading = ref(true);
const totalPages = ref(0);
const rawProducts = ref([]);
const platforms = ref([]); // Add platforms ref

const productVariantColumns = [
  { key: 'productName', label: 'Nom du produit' },
  { key: 'description', label: 'Description' },
  { key: 'genres', label: 'Genres' },
  { key: 'minAge', label: 'Âge Minimum' },
  { key: 'editor', label: 'Editeur' },
  { key: 'variantName', label: 'Nom de la variante' },
  { key: 'variantEdition', label: 'Édition de la variante' },
  { key: 'variantPrice', label: 'Prix' },
  { key: 'variantStock', label: 'Stock' },
  { key: 'platform', label: 'Plateforme' },
  { key: 'barcode', label: 'Code Barre' },
];

const actionsButtons = [
  { key: 'edit', label: 'Modifier', bgColor: 'blue', handler: 'editProductVariant' },
  { key: 'delete', label: 'Supprimer', bgColor: 'red', handler: 'deleteProductVariant' },
];

const transformData = (rawProducts, platformsData) => {
  if (!Array.isArray(rawProducts) || !Array.isArray(platformsData)) {
    console.error("Données produits ou plateformes invalides");
    return [];
  }

  const platformMap = Object.fromEntries(platformsData.map((platform) => [platform._id, platform.name]));
  
  return rawProducts.flatMap((product) => {
    return product.variants.map((variant) => {
      console.log('Product ID:', product._id);
      console.log('Variant ID:', variant._id);
      return {
        _id: product._id,
        productId: product._id,
        variantId: variant._id,
        productName: product.name,
        description: product.description,
        genres: product.genres.join(', '),
        minAge: product.minAge,
        editor: product.editor,
        sku: variant.sku,
        variantName: variant.name,
        variantEdition: variant.edition,
        variantPrice: variant.price,
        variantStock: variant.stock,
        platform: platformMap[variant.platform] || 'Inconnu',
        barcode: variant.barcode,
      };
    });
  });
};

onMounted(async () => {
  try {
    const response = await axios.get(`${VITE_API_ENDPOINT}/product`);
    console.log('Réponse API complète:', response.data);

    const { productsFound, platforms: platformsData } = response.data;
    if (!productsFound || !platformsData) {
      throw new Error("Données manquantes dans la réponse API");
    }

    rawProducts.value = productsFound;
    platforms.value = platformsData; // Store platforms data
    products.value = transformData(productsFound, platformsData);
    console.log('Données transformées:', products.value);
    totalPages.value = response.data.totalPages || 0;
  } catch (error) {
    console.error('Erreur lors de la récupération des produits :', error);
  }
  isLoading.value = false;
});

const findProductAndVariant = (variantId) => {
  for (const product of rawProducts.value) {
    const variant = product.variants.find(v => v._id === variantId);
    if (variant) {
      return { product, variant };
    }
  }
  return null;
};

const handleAction = (action, productId, variantId) => {
  console.log('Action appelée:', action, 'variantId:', variantId);
  actionFunctions[action](variantId);
};

const actionFunctions = {
  editProductVariant: (variantId) => {
    console.log('Edition de la variante:', variantId);
    const result = findProductAndVariant(variantId);
    
    if (!result) {
      console.error("Variante non trouvée avec l'ID:", variantId);
      return;
    }

    const { product, variant } = result;
    console.log('Produit trouvé:', product._id);
    console.log('Variante trouvée:', variant);

    selectedProductVariant.value = {
      productId: product._id,
      ...variant
    };
    showModalEditProductVariant.value = true;
  },
  
  deleteProductVariant: (variantId) => {
    console.log('Suppression de la variante:', variantId);
    const result = findProductAndVariant(variantId);
    
    if (!result) {
      console.error("Variante non trouvée avec l'ID:", variantId);
      return;
    }

    const { product, variant } = result;
    itemsToDelete.value = [{
      productId: product._id,
      variantId: variant._id
    }];
    showDeleteModal.value = true;
  }
};

const deleteFunction = async () => {
  try {
    const { productId, variantId } = itemsToDelete.value[0];
    console.log('Suppression de la variante:', variantId, 'du produit:', productId);
    
    await axios.delete(`${VITE_API_ENDPOINT}/product/${productId}/variant/${variantId}`);
    
    // Update both data references
    rawProducts.value = rawProducts.value.map(p => {
      if (p._id === productId) {
        return {
          ...p,
          variants: p.variants.filter(v => v._id !== variantId)
        };
      }
      return p;
    });
    
    products.value = transformData(rawProducts.value, platforms.value);
    showDeleteModal.value = false;
  } catch (error) {
    console.error('Erreur lors de la suppression de la variante:', error);
  }
};

const handleDeleteSelected = () => {
  if (itemsToDelete.value.length) {
    deleteFunction();
  }
};

const handleUpdateProductVariant = async (variantData) => {
  try {
    const formattedVariantData = {
      platform: variantData.platform,
      name: variantData.name,
      edition: variantData.edition,
      price: Number(variantData.price),
      stock: Number(variantData.stock),
      releaseDate: variantData.releaseDate,
      barcode: variantData.barcode,
      images: variantData.images
    };

    const response = await axios.put(
      `${VITE_API_ENDPOINT}/product/${selectedProductVariant.value.productId}/variant/${selectedProductVariant.value._id}`,
      formattedVariantData
    );

    // Mettre à jour le produit qui contient la variante
    const productIndex = rawProducts.value.findIndex(
      product => product._id === selectedProductVariant.value.productId
    );

    if (productIndex !== -1) {
      // Mettre à jour la variante spécifique dans le produit
      rawProducts.value[productIndex].variants = rawProducts.value[productIndex].variants.map(
        variant => variant._id === selectedProductVariant.value._id ? response.data.variant : variant
      );
      
      // Mettre à jour la liste transformée
      products.value = transformData(rawProducts.value, platforms.value);
    }

    showModalEditProductVariant.value = false;
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la variante:', error);
    alert('Une erreur est survenue lors de la mise à jour de la variante.');
  }
};
const onVariantAdded = (data) => {
  // Mettre à jour rawProducts
  if (data.product) {
    const productIndex = rawProducts.value.findIndex(p => p._id === data.product._id);
    if (productIndex !== -1) {
      rawProducts.value[productIndex] = data.product;
    }
  }
  
  // Mettre à jour la liste transformée
  products.value = transformData(rawProducts.value, platforms.value);
  
  // Fermer la modale
  showModalProductVariant.value = false;
};
</script>