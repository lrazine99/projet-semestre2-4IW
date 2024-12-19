<template>
  <div v-if="isModalOpen" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div class="bg-white p-6 rounded shadow-lg w-96">
      <h2 class="text-lg font-semibold mb-4">Confirmer la suppression</h2>
      <p class="text-gray-700 mb-6">Êtes-vous sûr de vouloir supprimer cet élément ? Cette action est irréversible.</p>

      <p v-if="errorMessage" class="text-red-600 mb-4">{{ errorMessage }}</p>

      <div class="flex justify-end space-x-4">
        <button @click="closeModal" class="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300">
          Annuler
        </button>
        <button
          @click="confirmDelete"
          class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          :disabled="loading"
        >
          <span v-if="loading" class="spinner-border animate-spin inline-block w-4 h-4 border-2 border-white rounded-full"></span>
          <span v-else>Confirmer</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue';

const props = defineProps({
  deleteFunction: {
    type: Function,
    required: true,
  },
  onSuccess: {
    type: Function,
    required: false,
  },
});

const emit = defineEmits(['close']);
const isModalOpen = ref(true);
const loading = ref(false);
const errorMessage = ref('');

const closeModal = () => {
  isModalOpen.value = false;
  emit('close');
};

const confirmDelete = async () => {
  loading.value = true;
  errorMessage.value = '';

  try {
    await props.deleteFunction();
    if (props.onSuccess) {
      props.onSuccess(); 
    }
    closeModal();
  } catch (error) {
    console.error(error);
    errorMessage.value = 'Une erreur est survenue lors de la suppression.';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.spinner-border {
  border-top-color: transparent;
  border-right-color: transparent;
  border-bottom-color: white;
  border-left-color: white;
}
</style>
