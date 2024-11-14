<template>
    <div>
      <!-- Bouton de suppression -->
      <button @click="openModal" class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
        Supprimer
      </button>
  
      <!-- Modale de confirmation -->
      <div v-if="isModalOpen" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <div class="bg-white p-6 rounded shadow-lg w-96">
          <h2 class="text-lg font-semibold mb-4">Confirmer la suppression</h2>
          <p class="text-gray-700 mb-6">
            Êtes-vous sûr de vouloir supprimer cet élément ? Cette action est irréversible.
          </p>
  
          <!-- Message d'erreur en cas d'échec de la requête -->
          <p v-if="errorMessage" class="text-red-600 mb-4">{{ errorMessage }}</p>
  
          <div class="flex justify-end space-x-4">
            <!-- Bouton Annuler -->
            <button @click="closeModal" class="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300">
              Annuler
            </button>
  
            <!-- Bouton Confirmer -->
            <button
              @click="confirmDelete"
              class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              :disabled="loading"
            >
              <!-- Affichage du chargement pendant la requête -->
              <span v-if="loading" class="spinner-border animate-spin inline-block w-4 h-4 border-2 border-white rounded-full"></span>
              <span v-else>Confirmer</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      deleteFunction: {
        type: Function,
        required: true,
      },
      onSuccess: {
        type: Function,
        required: false,
      },
    },
    data() {
      return {
        isModalOpen: false,
        loading: false,
        errorMessage: "",
      };
    },
    methods: {
      openModal() {
        this.isModalOpen = true;
      },
      closeModal() {
        this.isModalOpen = false;
        this.loading = false;
        this.errorMessage = "";
      },
      async confirmDelete() {
        this.loading = true;
        this.errorMessage = "";
  
        try {
          // Appel de la fonction de suppression passée en prop
          await this.deleteFunction();
          
          // Si la suppression est réussie, déclenche onSuccess et ferme la modale
          if (this.onSuccess) this.onSuccess();
          this.closeModal();
        } catch (error) {
          // Affichage du message d'erreur en cas d'échec
          this.errorMessage = "Une erreur est survenue lors de la suppression.";
        } finally {
          this.loading = false;
        }
      },
    },
  };
  </script>
  
  <style scoped>
  /* Animation de chargement pour le bouton de confirmation */
  .spinner-border {
    border-top-color: transparent;
    border-right-color: transparent;
    border-bottom-color: white;
    border-left-color: white;
  }
  </style>
  