<script setup>
import { useDatatable } from '../composable/useTable'
import { onMounted, ref, computed } from 'vue'
import { saveAs } from 'file-saver'
import DeleteModal from "@/components/DeleteModalComponent.vue";
import axios from 'axios'

const props = defineProps({
  apiEndpoint: {
    type: String,
    required: true
  },
  columns: {
    type: Array,
    required: true
  },
  showResetPassword: {
    type: Boolean,
    default: false
  },
  showAddUser: {
    type: Boolean,
    default: false
  },
  showAddProduct: {
    type: Boolean,
    default: false
  },
  showProductVariant: {
    type: Boolean,
    default: false
  },
  showProduct: {
    type: Boolean,
    default: false
  }
})

const { data, isLoading, fetchData, deleteRow, deleteRowVariant, updateRow, updateRowVariant, addRow, fetchVariantData, allProducts } = useDatatable(props.apiEndpoint)

const currentPage = ref(1)
const itemsPerPage = ref(10)
const searchTerm = ref('')
const sortColumn = ref(null)
const sortOrder = ref('asc')
const selectedRows = ref([])
const editingRow = ref(null)
const editedData = ref({})
const editingVariant = ref(null);
const editedVariantData = ref({});
const searchColumn = ref(null)
const showModalUser = ref(false)
const showModalProduct = ref(false)
const showModalVariant = ref(false)
const newUser = ref({ firstName: '', lastName: '', email: '' })
const newProduct = ref({ name: '', description: '', genres: '', ageMin: '', editor: '' })
const itemToDelete = ref(null);
const productVariants = ref([
  {
    platform: '',
    name: '',
    edition: '',
    price: 0,
    stock: 0,
    releaseDate: '',
    images: [],
    barcode: ''
  }
]);
const productVariantColumns = [
        { key: "variantName", label: "Nom de la variante" },
        { key: "variantEdition", label: "Édition de la variante" },
        { key: "variantPrice", label: "Prix" },
        { key: "variantStock", label: "Stock" },
        { key: "platform", label: "Plateforme" },
        { key: "barcode", label: "Code Barre" },
    ];

const platforms = ref([]);

const fetchPlatforms = async () => {
  try {
    const response = await axios.get('http://localhost:8080/platforms');
    platforms.value = response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des plateformes :", error);
  }
};
const searchableKeys = computed(() => {
  return props.columns
    .map(col => col.key)
})

const filteredData = computed(() => {
  let result = [...data.value]

  if (searchTerm.value) {
    result = result.filter((row) =>
      searchColumn.value
        ? String(row[searchColumn.value] || '')
            .toLowerCase()
            .includes(searchTerm.value.toLowerCase())
        : searchableKeys.value.some((key) =>
            String(row[key] || '')
              .toLowerCase()
              .includes(searchTerm.value.toLowerCase())
          )
    )
  }

  if (sortColumn.value) {
    result.sort((a, b) => {
      if (a[sortColumn.value] < b[sortColumn.value]) return sortOrder.value === 'asc' ? -1 : 1
      if (a[sortColumn.value] > b[sortColumn.value]) return sortOrder.value === 'asc' ? 1 : -1
      return 0
    })
  }

  return result
})

const paginatedData = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage.value
  const endIndex = startIndex + itemsPerPage.value
  return filteredData.value.slice(startIndex, endIndex)
})
const hasNextPage = computed(() => {
  const nextPageStartIndex = currentPage.value * itemsPerPage.value
  return nextPageStartIndex < filteredData.value.length
})

const goToNextPage = () => {
  if (hasNextPage.value) {
    currentPage.value++
  }
}

const goToPreviousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

onMounted(() => {
  handleFetchData();
  fetchPlatforms(); 
});


const handleFetchData = () => {
  if (props.showProduct) {
    fetchVariantData();
  } else {
    fetchData();
  }
};


const startEditing = (row) => {
  editingRow.value = row._id
  editedData.value = { ...row }
}

const cancelEditing = () => {
  editingRow.value = null
  editedData.value = {}
}

const saveEditing = async (id) => {
  try {
    await handleUpdate(id, editedData.value)
    const index = data.value.findIndex((row) => row._id === id)
    if (index !== -1) {
      data.value[index] = { ...data.value[index], ...editedData.value }
    }

    editingRow.value = null
    editedData.value = {}
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error)
  }
}

const startEditingVariant = (row) => {
  editingVariant.value = row.variantId;
  editedVariantData.value = { ...row };
  const matchingPlatform = platforms.value.find(p => p.name === row.platform);
  editedVariantData.value.platform = matchingPlatform._id;
};

const cancelEditingVariant = () => {
  editingVariant.value = null;
  editedVariantData.value = {};
};

const saveEditingVariant = async (row) => {
  try {
    const {
  variantName: name,
  variantEdition: edition,
  variantPrice: price,
  variantStock: stock,
  platform,
  barcode,
} = editedVariantData.value;

const updatedData = { name, edition, price, stock, platform, barcode };

    await handleUpdateVariant(row._id, row.variantId, updatedData);

  } catch (error) {
    console.error("Erreur lors de la mise à jour de la variante :", error);
  }
};

const handleDelete = (item) => {
  itemToDelete.value = { _id: item._id };
};

const handleDeleteVariant = (item) => {
  itemToDelete.value = { productId: item._id, variantId: item.variantId };
};

const handleUpdateVariant = (productId, variantId, updatedData) => updateRowVariant(productId, variantId, updatedData)

const handleUpdate = (id, updatedData) => updateRow(id, updatedData)
const handleAddRow = (newData) => addRow(newData)

const handleSort = (columnKey) => {
  if (sortColumn.value === columnKey) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortColumn.value = columnKey
    sortOrder.value = 'asc'
  }
}

const handleExport = () => {
  const columnsToExport = props.columns

  const header = columnsToExport.map((col) => col.label).join('\t')

  const rows = filteredData.value.map((row) =>
    columnsToExport.map((col) => row[col.key] || '').join('\t')
  )

  const csvContent = [header, ...rows].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  saveAs(blob, 'export.csv')
}

const sendResetEmail = async (email) => {
  try {
    const response = await fetch('http://localhost:8080/request-reset-password', {
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

const setSearchColumn = (columnKey) => {
  if (searchColumn.value === columnKey) {
    searchColumn.value = null
  } else {
    searchColumn.value = columnKey
  }
  searchTerm.value = ''
}

const handleAddUser = async () => {
  try {
    const response = await axios.post('http://localhost:8080/users/admin/add', newUser.value)

    if (response.status === 201) {
      await axios.post('http://localhost:8080/request-reset-password', {
        email: newUser.value.email
      })
      alert('Utilisateur ajouté et email envoyé avec succès !')
    }

    showModalUser.value = false
    newUser.value = { firstName: '', lastName: '', email: '' }
    handleFetchData()
  } catch (error) {
    console.error("Erreur lors de l'ajout :", error)
    alert(error.response?.data?.message || "Une erreur est survenue lors de l'ajout.")
  }
}

const handleAddProduct = async () => {
  try {
    const formattedProduct = {
      ...newProduct.value,
      genres: newProduct.value.genres.split(',').map(genre => genre.trim()),
      variants: productVariants.value
    };

    const response = await axios.post('http://localhost:8080/product', formattedProduct);

    showModalProduct.value = false;
    newProduct.value = { name: '', description: '', genres: '', minAge: '', editor: '' };
    productVariants.value = [{
      platform: '',
      name: '',
      edition: '',
      price: 0,
      stock: 0,
      releaseDate: '',
      images: [],
      barcode: ''
    }]; 
    handleFetchData()
    alert(response.data.message || "Produit ajouté avec succès !");
  } catch (error) {
    console.error("Erreur lors de l'ajout :", error);
    alert(error.response?.data?.message || "Une erreur est survenue lors de l'ajout.");
  }
};

const addVariant = () => {
  productVariants.value.push({
    platform: '',
    name: '',
    edition: '',
    price: 0,
    stock: 0,
    releaseDate: '',
    images: [],
    barcode: ''
  });
};


const toggleSelection = (row) => {
  const index = selectedRows.value.findIndex((selected) => selected === row._id)
  if (index === -1) {
    selectedRows.value.push(row._id)
  } else {
    selectedRows.value.splice(index, 1)
  }
}

const toggleAllSelection = () => {
  if (selectedRows.value.length === filteredData.value.length) {
    selectedRows.value = []
  } else {
    selectedRows.value = filteredData.value.map((row) => row._id)
  }
}

const handleDeleteSelected = () => {
  if (selectedRows.value.length === 0) {
    return;
  }
  itemToDelete.value = selectedRows.value;
};

const confirmDeleteSelected = async () => {
  try {
    for (const itemId of itemToDelete.value) {
      await deleteRow(itemId);
    }
    selectedRows.value = [];
    itemToDelete.value = null;
    handleFetchData()
  } catch (error) {
    console.error("Erreur lors de la suppression :", error);
  }
};
const selectedProductId = ref(null);
const variantName = ref('')
const variantEdition = ref('')
const variantPrice = ref(null)
const variantStock = ref(null)
const images = ref('')
const releaseDate = ref('')
const platform = ref('')
const barcode = ref('')

const handleAddVariant = async () => {
  if (!selectedProductId.value || !variantName.value || !variantEdition.value || 
      !variantPrice.value || !variantStock.value || !images.value || 
      !releaseDate.value || !platform.value || !barcode.value) {
    alert('Tous les champs doivent être remplis');
    return;
  }

  const newVariantData = {
    platform: platform.value._id || platform.value,
    name: variantName.value,
    edition: variantEdition.value,
    images: [images.value],
    releaseDate: releaseDate.value,
    price: variantPrice.value,
    stock: variantStock.value,
    barcode: barcode.value
  };

  try {
    const response = await axios.post(
      `http://localhost:8080/product/${selectedProductId.value}/variant`, 
      newVariantData
    );
    console.log('Variante ajoutée avec succès', response.data);
    
    showModalVariant.value = false;
    selectedProductId.value = null;
    variantName.value = '';
    variantEdition.value = '';
    variantPrice.value = null;
    variantStock.value = null;
    images.value = '';
    releaseDate.value = '';
    platform.value = '';
    barcode.value = '';

    handleFetchData();

    return response.data;
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la variante:', error.response?.data || error);
  }
};

const removeVariant = (index) => {
  productVariants.value.splice(index, 1);
};


</script>

<template>
  <div v-if="isLoading" class="text-center text-xl font-semibold text-gray-500 py-10">
    Chargement...
  </div>
  <div v-else>
    <div class="flex justify-between mb-4">
      <input
        v-model="searchTerm"
        class="p-2 border border-gray-300 rounded-md"
        :placeholder="
          searchColumn
            ? `Rechercher dans ${columns.find((col) => col.key === searchColumn)?.label}`
            : 'Rechercher...'
        "
      />
      <div class="flex gap-4">
        <router-link
          to="/admin/products/variant"
          v-if="showProductVariant" 
          class="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600"
        >
          Voir les variants
        </router-link>
        <router-link
          to="/admin/products"
          v-if="showProduct" 
          class="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600"
        >
          Voir les produits
        </router-link>
        <button
          @click="handleDeleteSelected"
          class="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
          :disabled="selectedRows.length === 0"
        >
          Supprimer la sélection
        </button>
        <button
          v-if="showAddUser"      
          @click="showModalUser = true"
          class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Ajouter un utilisateur
        </button>
        <button
          v-if="showProduct"      
          @click="showModalVariant = true"
          class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Ajouter une variante
        </button>
        <button
          v-if="showAddProduct"      
          @click="showModalProduct = true"
          class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Ajouter un produit
        </button>
        <button
          @click="handleExport"
          class="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
        >
          Exporter CSV
        </button>
      </div>
    </div>
  <div v-if="showModalVariant" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
    <div class="bg-white p-6 rounded-lg shadow-lg w-9/12">
      <h2 class="text-xl font-bold mb-4">Ajouter une variante</h2>
<div class="grid grid-cols-4 gap-4">
      <div class="mb-4">
        <label for="product-select" class="block font-medium mb-1">Produit :</label>
        <select
          id="product-select"
          v-model="selectedProductId" 
          class="w-full p-2 border border-gray-300 rounded"
        >
          <option v-for="product in allProducts" :key="product._id" :value="product._id">
            {{ product.name }}
          </option>
        </select>
      </div>

      <div class="mb-4">
        <label class="block font-medium mb-1">Nom de la variante :</label>
        <input
          v-model="variantName"
          type="text"
          placeholder="Nom de la variante"
          class="w-full p-2 border border-gray-300 rounded"
        />
      </div>
      <div class="mb-4">
        <label class="block font-medium mb-1">Édition :</label>
        <input
          v-model="variantEdition"
          type="text"
          placeholder="Édition"
          class="w-full p-2 border border-gray-300 rounded"
        />
      </div>
      <div class="mb-4">
        <label class="block font-medium mb-1">Prix :</label>
        <input
          v-model="variantPrice"
          type="number"
          placeholder="Prix"
          class="w-full p-2 border border-gray-300 rounded"
        />
      </div>
      <div class="mb-4">
        <label class="block font-medium mb-1">Stock :</label>
        <input
          v-model="variantStock"
          type="number"
          placeholder="Stock"
          class="w-full p-2 border border-gray-300 rounded"
        />
      </div>
      <div class="mb-4">
        <label class="block font-medium mb-1">Image :</label>
        <input
          v-model="images"
          type="text"
          placeholder="Image"
          class="w-full p-2 border border-gray-300 rounded"
        />
      </div>
      <div class="mb-4">
        <label class="block font-medium mb-1">Date de sortie :</label>
        <input
          v-model="releaseDate"
          type="date"
          placeholder="Date de sortie"
          class="w-full p-2 border border-gray-300 rounded"
        />
      </div>
      <div class="mb-4">
        <label for="platform-select" class="block font-medium mb-1">Plateforme :</label>
        <select
          id="platform-select"
          v-model="platform"
          class="w-full p-2 border border-gray-300 rounded"
        >
          <option disabled value="">Sélectionnez une plateforme</option>
          <option v-for="platformOption in platforms" :key="platformOption._id" :value="platformOption._id">
            {{ platformOption.name }}
          </option>
        </select>
      </div>
      <div class="mb-4">
        <label class="block font-medium mb-1">Code Barre :</label>
        <input
          v-model="barcode"
          type="text"
          placeholder="Code barre"
          class="w-full p-2 border border-gray-300 rounded"
        />
      </div>
      <div class="flex justify-end">
        <button @click="showModalVariant = false" class="bg-gray-500 text-white px-4 py-2 rounded-md mr-2">
          Annuler
        </button>
        <button @click="handleAddVariant" class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
          Ajouter
        </button>
      </div>
    </div>
  </div>
</div>
    <div
      v-if="showModalUser"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div class="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 class="text-xl font-bold mb-4">Ajouter un utilisateur</h2>
        <form @submit.prevent="handleAddUser">
          <div class="mb-4">
            <label for="firstName" class="block text-sm font-medium">Prénom</label>
            <input
              v-model="newUser.firstName"
              id="firstName"
              type="text"
              class="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div class="mb-4">
            <label for="lastName" class="block text-sm font-medium">Nom</label>
            <input
              v-model="newUser.lastName"
              id="lastName"
              type="text"
              class="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div class="mb-4">
            <label for="email" class="block text-sm font-medium">Email</label>
            <input
              v-model="newUser.email"
              id="email"
              type="email"
              class="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div class="flex justify-end gap-4">
            <button
              @click="showModalUser = false"
              type="button"
              class="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100"
            >
              Annuler
            </button>
            <button
              type="submit"
              class="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600"
            >
              Ajouter
            </button>
          </div>
        </form>
      </div>
    </div>
    <div
  v-if="showModalProduct"
  class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
>
  <div class="bg-white p-6 rounded-lg shadow-lg w-9/12 max-h-[90vh] overflow-y-auto">
    <h2 class="text-xl font-bold mb-4">Ajouter un produit</h2>
    <form @submit.prevent="handleAddProduct">
      <div class="grid grid-cols-4 gap-4 mb-4">
        <div>
          <label for="productName" class="block text-sm font-medium">Nom du produit</label>
          <input
            v-model="newProduct.name"
            id="productName"
            type="text"
            class="w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        <div>
          <label for="productDescription" class="block text-sm font-medium">Description</label>
          <input
            v-model="newProduct.description"
            id="productDescription"
            type="text"
            class="w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        <div>
          <label for="productGenres" class="block text-sm font-medium">Genres</label>
          <input
            v-model="newProduct.genres"
            id="productGenres"
            type="text"
            class="w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        <div>
          <label for="productAge" class="block text-sm font-medium">Âge minimum</label>
          <input
            v-model="newProduct.minAge"
            id="productAge"
            type="number"
            min="0"
            class="w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        <div>
          <label for="productEditor" class="block text-sm font-medium">Éditeur</label>
          <input
            v-model="newProduct.editor"
            id="productEditor"
            type="text"
            class="w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>
      </div>

      <h3 class="text-lg font-semibold mt-6 mb-4">Ajouter des variantes</h3>

      <div v-for="(variant, index) in productVariants" :key="index" class="mb-4">
        <div class="grid grid-cols-4 gap-4 mb-4">
          <div class="col-span-4 flex justify-end mt-2">
            <button
              type="button"
              @click="removeVariant(index)"
              class="px-4 py-2 text-white bg-red-500 rounded-md hover:bg-red-600"
            >
              Supprimer
            </button>
          </div>
          <div class="mb-4">
            <label for="variantPlatform" class="block text-sm font-medium">Plateforme</label>
            <select
              v-model="variant.platform"
              id="variantPlatform"
              class="w-full p-2 border border-gray-300 rounded-md"
              required
            >
              <option value="" disabled selected>Choisir une plateforme</option>
              <option v-for="platform in platforms" :key="platform._id" :value="platform._id">
                {{ platform.name }}
              </option>
            </select>
          </div>

          <div>
            <label for="variantName" class="block text-sm font-medium">Nom de la variante</label>
            <input
              v-model="variant.name"
              id="variantName"
              type="text"
              class="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label for="variantEdition" class="block text-sm font-medium">Édition</label>
            <input
              v-model="variant.edition"
              id="variantEdition"
              type="text"
              class="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label for="variantImage" class="block text-sm font-medium">Image</label>
            <input
              v-model="variant.images"
              id="variantImage"
              type="text"
              class="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label for="variantPrice" class="block text-sm font-medium">Prix</label>
            <input
              v-model="variant.price"
              id="variantPrice"
              type="number"
              min="0"
              class="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label for="variantStock" class="block text-sm font-medium">Stock</label>
            <input
              v-model="variant.stock"
              id="variantStock"
              type="number"
              min="0"
              class="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label for="variantReleaseDate" class="block text-sm font-medium">Date de sortie</label>
            <input
              v-model="variant.releaseDate"
              id="variantReleaseDate"
              type="date"
              class="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label for="variantBarcode" class="block text-sm font-medium">Code-barres</label>
            <input
              v-model="variant.barcode"
              id="variantBarcode"
              type="text"
              class="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
        </div>
      </div>

      <div class="flex justify-between mb-4">
        <button
          type="button"
          @click="addVariant"
          class="px-4 py-2 text-white bg-green-500 rounded-md hover:bg-green-600"
        >
          Ajouter une variante
        </button>
      </div>

      <div class="flex justify-end gap-4">
        <button
          @click="showModalProduct = false"
          type="button"
          class="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100"
        >
          Annuler
        </button>
        <button
          type="submit"
          class="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600"
        >
          Ajouter
        </button>
      </div>
    </form>
  </div>
</div>

    <div class="overflow-x-auto bg-white shadow-md rounded-lg">
      <table class="min-w-full table-auto">
        <thead class="bg-gray-100 text-gray-600 text-sm">
          <tr>
            <th class="py-3 px-6 text-left font-medium">
              <input
                type="checkbox"
                @change="toggleAllSelection"
                :checked="selectedRows.length === filteredData.length"
              />
            </th>
            <th
              v-for="column in columns"
              :key="column.key"
              class="py-3 px-6 text-left font-medium cursor-pointer"
              @click="handleSort(column.key)"
            >
              <div class="flex items-center">
                {{ column.label }}
                <span v-if="sortColumn === column.key" class="ml-1">
                  {{ sortOrder === 'asc' ? '⬇️' : '⬆️' }}
                </span>
                <button
                  @click.stop="setSearchColumn(column.key)"
                  class="ml-2 text-blue-500 hover:text-blue-700"
                  title="Rechercher dans cette colonne"
                >
                  🔍
                </button>
              </div>
            </th>
            <th class="py-3 px-6 text-left font-medium">Actions</th>
          </tr>
        </thead>
        <tbody class="text-sm text-gray-700">
  <tr v-for="row in paginatedData" :key="row._id" class="border-b hover:bg-gray-50">
    <td class="py-3 px-6">
      <input type="checkbox" :value="row._id" v-model="selectedRows" />
    </td>
    <td v-for="column in columns" :key="column.key" class="py-3 px-6">
      <!-- Si showProduct est vrai, on édite la variante -->
      <template v-if="showProduct && editingVariant === row.variantId && productVariantColumns.some(col => col.key === column.key)">
        <div v-if="column.key === 'platform'">
          <!-- Liste déroulante pour la plateforme -->
          <select v-model="editedVariantData.platform" id="platform" class="w-full p-1 border border-gray-300 rounded">
            <option v-for="platform in platforms" :key="platform._id" :value="platform._id">
              {{ platform.name }}
            </option>
          </select>
        </div>
        <template v-else>
          <!-- Champ de texte pour les autres colonnes -->
          <input
            v-model="editedVariantData[column.key]"
            class="w-full p-1 border border-gray-300 rounded"
            :type="column.type || 'text'"
          />
        </template>
      </template>

      <!-- Si showProduct est faux, on édite le produit -->
      <template v-else-if="!showProduct && editingRow === row._id">
        <input
          v-model="editedData[column.key]"
          class="w-full p-1 border border-gray-300 rounded"
          :type="column.type || 'text'"
        />
      </template>

      <template v-else>
        {{ row[column.key] }}
      </template>
    </td>
    <td class="py-3 px-6 flex">
      <!-- Boutons d'édition pour les variantes ou produits -->
      <template v-if="showProduct && editingVariant === row.variantId">
        <button
          @click="saveEditingVariant(row)"
          class="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200"
        >
          Sauvegarder
        </button>
        <button
          @click="cancelEditingVariant"
          class="ml-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-200"
        >
          Annuler
        </button>
      </template>

      <template v-else-if="!showProduct && editingRow === row._id">
        <button
          @click="saveEditing(row._id)"
          class="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200"
        >
          Sauvegarder
        </button>
        <button
          @click="cancelEditing"
          class="ml-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-200"
        >
          Annuler
        </button>
      </template>

      <template v-else>
        <!-- Boutons pour commencer l'édition -->
        <button
          v-if="showProduct"
          @click="startEditingVariant(row)"
          class="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
        >
          Modifier variant
        </button>
        
        <button
          v-else
          @click="startEditing(row)"
          class="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
        >
          Modifier
        </button>
        
        <button
          v-if="!showProduct"
          @click="handleDelete(row)"
          class="ml-2 px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition duration-200"
        >
          Supprimer
        </button>

        <button
          v-if="showProduct"
          @click="handleDeleteVariant(row)"
          class="ml-2 px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition duration-200"
        >
          Supprimer
        </button>

        <button
          v-if="showResetPassword"
          @click="sendResetEmail(row.email)"
          class="ml-2 px-4 py-2 text-white bg-yellow-600 rounded-lg hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition duration-200"
        >
          Réinitialiser mot de passe
        </button>
        <DeleteModal
          v-if="itemToDelete"
          :deleteFunction="Array.isArray(itemToDelete) ? confirmDeleteSelected : (itemToDelete.variantId ? () => deleteRowVariant(itemToDelete.productId, itemToDelete.variantId) : () => deleteRow(itemToDelete._id))"
          @close="itemToDelete = null"
          :onSuccess="handleFetchData"
        />
      </template>
    </td>
  </tr>
</tbody>
      </table>
    </div>
    <div class="flex justify-center items-center my-5">
      <div>
        <button
          @click="goToPreviousPage"
          :disabled="currentPage === 1"
          class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          Précédent
        </button>
        <span class="px-4">Page {{ currentPage }}</span>
        <button
          @click="goToNextPage"
          :disabled="!hasNextPage"
          class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          Suivant
        </button>
      </div>
    </div>
  </div>
</template>
