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
  }
})

const { data, isLoading, fetchData, deleteRow, updateRow, addRow } = useDatatable(props.apiEndpoint)

const currentPage = ref(1)
const itemsPerPage = ref(10)
const searchTerm = ref('')
const sortColumn = ref(null)
const sortOrder = ref('asc')
const selectedRows = ref([])
const editingRow = ref(null)
const editedData = ref({})
const searchColumn = ref(null)
const showModal = ref(false)
const newUser = ref({ firstName: '', lastName: '', email: '' })
const itemToDelete = ref(null);

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
        : searchableKeys.some((key) =>
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
  fetchData()
})

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

const handleDelete = (item) => {
  itemToDelete.value = item;
};
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

    showModal.value = false
    newUser.value = { firstName: '', lastName: '', email: '' }
    fetchData()
  } catch (error) {
    console.error("Erreur lors de l'ajout :", error)
    alert(error.response?.data?.message || "Une erreur est survenue lors de l'ajout.")
  }
}

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
    for (const userId of itemToDelete.value) {
      await deleteRow(userId);
    }
    selectedRows.value = [];
    itemToDelete.value = null;
    fetchData();
  } catch (error) {
    console.error("Erreur lors de la suppression :", error);
  }
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
        <button
          @click="handleDeleteSelected"
          class="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
          :disabled="selectedRows.length === 0"
        >
          Supprimer la sélection
        </button>
        <button
          v-if="showAddUser"      
          @click="showModal = true"
          class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Ajouter un utilisateur
        </button>
        <button
          @click="handleExport"
          class="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
        >
          Exporter CSV
        </button>
      </div>
    </div>

    <div
      v-if="showModal"
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
              @click="showModal = false"
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
              <template v-if="editingRow === row._id">
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
              <template v-if="editingRow === row._id">
                <button
                  @click="saveEditing(row._id)"
                  class="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200"
                >
                  Sauvegarder
                </button>
                <button
                  @click="cancelEditing"
                  class="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-200"
                >
                  Annuler
                </button>
              </template>
              <template v-else>
                <button
                  @click="startEditing(row)"
                  class="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                >
                  Modifier
                </button>
                <button
                  @click="handleDelete(row)"
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
                  :deleteFunction="itemToDelete.length > 1 ? confirmDeleteSelected : () => deleteRow(itemToDelete._id)"
                  @close="itemToDelete = null"
                  :onSuccess="fetchData"
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
