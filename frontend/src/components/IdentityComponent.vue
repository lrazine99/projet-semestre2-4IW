<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 py-16">
    <div class="flex items-start p-4">
      <div class="mr-4">
        <img src="../assets/images/euro-256.ico" alt="Free Shipping Icon" class="h-16 w-16" />
      </div>
      <div class="flex flex-col text-left">
        <h3 class="text-xl font-bold mb-1">{{ title1 }}</h3>
        <p class="text-gray-600">{{ description1 }}</p>
      </div>
    </div>
    <div class="flex items-start p-4">
      <div class="mr-4">
        <img src="../assets/images/online-support-256.ico" alt="Support 24/7 Icon" class="h-16 w-16" />
      </div>
      <div class="flex flex-col text-left">
        <h3 class="text-xl font-bold mb-1">{{ title2 }}</h3>
        <p class="text-gray-600">{{ description2 }}</p>
      </div>
    </div>
    <div class="flex items-start p-4">
      <div class="mr-4">
        <img src="../assets/images/delivery-256.ico" alt="Fast Delivery" class="h-16 w-16" />
      </div>
      <div class="flex flex-col text-left">
        <h3 class="text-xl font-bold mb-1">{{ title3 }}</h3>
        <p class="text-gray-600">{{ description3 }}</p>
      </div>
    </div>
    <div class="flex items-start p-4">
      <div class="mr-4">
        <img src="../assets/images/joystick-256.ico" alt="All games" class="h-16 w-16" />
      </div>
      <div class="flex flex-col text-left">
        <h3 class="text-xl font-bold mb-1">{{ title4 }}</h3>
        <p class="text-gray-600">{{ description4 }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
  defineProps({
    title1: {
      type: String,
      default: 'Pas de frais de livraison',
    },
    description1: {
      type: String,
      default: 'Pas un centime de plus',
    },
    title2: {
      type: String,
      default: 'Support 24/7',
    },
    description2: {
      type: String,
      default: 'Support client disponible 24/7',
    },
    title3: {
      type: String,
      default: 'Livraison rapide',
    },
    description3: {
      type: String,
      default: 'Soyez livrez en moins de 30 jours',
    },
    title4: {
      type: String,
      default: 'Tous les jeux',
    },
    description4: {
      type: String,
      default: 'Le plus grand choix de jeux vidéo',
    },
  });
</script>
