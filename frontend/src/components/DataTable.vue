<script setup>
import { formatDate } from '@/utils/utils';
import { saveAs } from 'file-saver'
import { computed, ref } from 'vue'

const { columns, dataAll, actionsButtons, totalPages } = defineProps({
  columns: {
    type: Array,
    required: true
  },
  dataAll: {
    type: Array,
    required: true
  },
  handleAddUser: {
    type: Function,
    required: true
  },
  actionsButtons: {
    type: Array,
    required: true
  },
  totalPages: {
    type: Number,
    required: true
  },
})
console.log(dataAll);


const currentPage = ref(1)
const itemsPerPage = ref(10)
const searchTerm = ref('')
const sortColumn = ref(null)
const sortOrder = ref('asc')
const selectedRows = ref([])
const searchColumn = ref(null);

const searchableKeys = computed(() => {
  return columns
    .map(col => col.key)
})

const filteredData = computed(() => {

  let result = [...dataAll]

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

const handleSort = (columnKey) => {
  if (sortColumn.value === columnKey) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortColumn.value = columnKey
    sortOrder.value = 'asc'
  }
}

const handleExport = () => {
  const columnsToExport = columns

  const header = columnsToExport.map((col) => col.label).join('\t')

  const rows = filteredData.value.map((row) =>
    columnsToExport.map((col) => row[col.key] || '').join('\t')
  )

  const csvContent = [header, ...rows].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  saveAs(blob, 'export.csv')
}

const setSearchColumn = (columnKey) => {
  if (searchColumn.value === columnKey) {
    searchColumn.value = null
  } else {
    searchColumn.value = columnKey
  }
  searchTerm.value = ''
}

const toggleAllSelection = () => {
  if (selectedRows.value.length === filteredData.value.length) {
    selectedRows.value = [];
  } else {
    selectedRows.value = filteredData.value.map((row) =>
      row._id
    );
  }
};
const isValidDate = (value) => new Date(value) !== 'Invalid Date' && !isNaN(new Date(value));

</script>
<template>
  <div v-if="isLoading" class="text-center text-xl font-semibold text-gray-500 py-10">
    Chargement...
  </div>
  <div v-else class="bg-white shadow-md rounded-lg p-6">
    <div class="flex justify-between mb-4 ">
      <input v-model="searchTerm" class="p-2 border border-gray-300 rounded-md" :placeholder="searchColumn
        ? `Rechercher dans ${columns.find((col) => col.key === searchColumn)?.label}`
        : 'Rechercher...'
        " />
      <div class="flex gap-4">
        <button @click="$emit('handleDeleteSelected', selectedRows)"
          class="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600" :disabled="selectedRows.length === 0">
          Supprimer la sélection
        </button>

        <button @click="handleExport" class="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600">
          Exporter CSV
        </button>
      </div>
    </div>



    <div class="overflow-x-auto bg-white shadow-md rounded-lg">
      <table class="min-w-full table-auto">
        <thead class="bg-gray-100 text-gray-600 text-sm">
          <tr>
            <th class="py-3 px-6 text-left font-medium">
              <input type="checkbox" @change="toggleAllSelection"
                :checked="selectedRows.length === filteredData.length" />
            </th>
            <th v-for="column in columns" :key="column.key" class="py-3 px-6 text-left font-medium cursor-pointer"
              @click="handleSort(column.key)">
              <div class="flex items-center">
                {{ column.label }}
                <span v-if="sortColumn === column.key" class="ml-1">
                  {{ sortOrder === 'asc' ? '⬇️' : '⬆️' }}
                </span>
                <button @click.stop="setSearchColumn(column.key)" class="ml-2 text-blue-500 hover:text-blue-700"
                  title="Rechercher dans cette colonne">
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
              <span>{{ isValidDate(row[column.key]) ? formatDate(row[column.key]) : row[column.key] }}</span>
            </td>
            <td class="py-3 px-6 flex space-x-1">
              <button v-for="action in actionsButtons" :key="action.key"
                @click="$emit('action-click', action.handler, row._id)"
                :class="`bg-${action.bgColor}-500 hover:bg-${action.bgColor}-700`"
                class="px-4 py-2 text-white  rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 transition duration-200">
                {{ action.label }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="flex justify-center items-center my-5">
      <div>
        <button @click="goToPreviousPage" :disabled="currentPage === 1"
          class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50">
          Précédent
        </button>
        <span class="px-4">Page {{ currentPage }}/{{ totalPages }}</span>
        <button @click="goToNextPage" :disabled="!hasNextPage"
          class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50">
          Suivant
        </button>
      </div>
    </div>
  </div>
</template>