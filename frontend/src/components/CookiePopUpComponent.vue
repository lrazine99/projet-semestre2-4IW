<template>
    <div v-if="showPopup" class="fixed inset-0 bg-gray-800 bg-opacity-70 flex justify-center items-center z-50 transition-opacity duration-500 ease-out">
      <div class="bg-white rounded-xl shadow-xl max-w-2xl w-full p-8 transform transition-all scale-95 opacity-0 animate-fadeIn">
        <div class="text-center">
          <h2 class="text-3xl font-semibold text-gray-900 mb-4">Nous respectons votre vie privée</h2>
          <p class="text-lg text-gray-700 mb-6 leading-relaxed">
            Ce site ne collecte ni n'utilise de cookies pour suivre vos activités. Toutes les données collectées sont exclusivement liées aux achats effectués sur le site. Aucune autre donnée personnelle n'est collectée, stockée, ni vendue. Vous êtes libre de naviguer sans soucis.
          </p>
          <button 
            @click="closePopup"
            class="w-full py-3 bg-blue-600 text-white font-semibold rounded-full shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 transition-all duration-200">
            Accéder au site
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  
  const showPopup = ref(false);
  
  onMounted(() => {
    if (!localStorage.getItem("popupShown")) {
      showPopup.value = true;
    }
  });
  
  const closePopup = () => {
    showPopup.value = false;
    localStorage.setItem("popupShown", "true");
  };
  </script>

  <style scoped>
  @keyframes fadeIn {
    0% {
      opacity: 0;
      transform: scale(0.95);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }
  
  .animate-fadeIn {
    animation: fadeIn 0.4s ease-out forwards;
  }
  </style>
  