<template>
  <LoaderComponent v-if="loading" />
  <div v-else class="max-w-7xl mx-auto px-4 py-8 w-100">

    <!-- Admin Dashboard -->
    <div class="mt-10 max-w-7xl mx-auto px-4">
      <TitleComponent titleText="Admin Dashboard" />

      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 md:gap-6 gap-2">

        <!-- Products Chart -->
        <div class="bg-white shadow-md p-6 rounded-lg flex items-center space-x-4">
          <!-- User Icon -->
          <div class="flex items-center justify-center w-12 h-12 bg-teal-100 text-teal-500 rounded-full">
            <i class="pi pi-user" style="font-size: 2.5rem"></i>

          </div>

          <!-- Stats Content -->
          <div>
            <p class="text-lg font-semibold text-gray-700">Total utilisateurs</p>
            <div class="flex items-center space-x-2">
              <p class="text-2xl font-bold text-gray-800">{{ totalUsers }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white shadow-md p-6 rounded-lg flex items-center space-x-4">
          <!-- User Icon -->
          <div class="flex items-center justify-center w-12 h-12 bg-teal-100 text-teal-500 rounded-full">
            <i class="pi pi-shopping-cart" style="font-size: 2.5rem"></i>
          </div>

          <!-- Stats Content -->
          <div>
            <p class="text-lg font-semibold text-gray-700">Total Produits</p>
            <div class="flex items-center space-x-2">
              <p class="text-2xl font-bold text-gray-800">{{ totalProducts }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white shadow-md p-6 rounded-lg flex items-center space-x-4">
          <!-- User Icon -->
          <div class="flex items-center justify-center w-12 h-12 bg-teal-100 text-teal-500 rounded-full">
            <i class="pi pi-money-bill" style="font-size: 2.5rem"></i>

          </div>

          <!-- Stats Content -->
          <div>
            <p class="text-lg font-semibold text-gray-700">Chiffre d'affaires</p>
            <div class="flex items-center space-x-2">
              <p class="text-2xl font-bold text-gray-800">
                {{ totalRevenueAmount !== undefined && totalRevenueAmount !== null ? totalRevenueAmount.toFixed(2) : '0.00' }} €
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-2 md:gap-6 gap-2 mt-6">

        <!-- Orders Chart -->
        <div class="bg-white shadow-md p-6 rounded-lg ">
          <h2 class="text-lg text-center font-semibold text-gray-800 mb-4">
            Vos Commandes par mois
          </h2>
          <BarChart :dataSets="ordersByMonthArray" height="250" labelTitle="volume des commandes" ></BarChart>
        </div>

        <div class="bg-white shadow-md p-6 rounded-lg  ">
          <h2 class="text-lg font-semibold text-center text-gray-800 mb-4">
            Votre chiffre d'affaire par mois
          </h2>
          <BarChart  :dataSets="revenueByMonthArray" height="250" labelTitle="volume chiffre d'affaire par mois"></BarChart>
        </div>
      </div>
    </div>
    <!-- Period Selector -->

    <div class="bg-white  rounded-lg shadow-lg mt-8 pt-2 w-auto ">
      <h2 class="text-lg text-center font-semibold text-gray-800 mb-4">
        Inscription utilisateurs
      </h2>
      <div class="flex justify-center mb-6">

        <div class="flex items-center space-x-4">
          <label for="period" class="text-lg font-medium text-gray-700">
            Période :
          </label>
          <select id="period" v-model="period" @change="fetchStats"
            class="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
            <option value="day">15 derniers jours</option>
            <option value="month">15 derniers mois</option>
            <option value="year">15 dernières années</option>
          </select>
        </div>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="text-red-600 border border-red-600 rounded-lg p-4 mb-6 bg-red-50">
        {{ error }}
      </div>

      <!-- Chart Container -->
      <div v-if="!loading && !error" class=" p-6 rounded-lg shadow-lg">
        <canvas id="usersChart"></canvas>
      </div>
    </div>

  </div>


</template>



<script setup>
import { ref, onMounted, watch } from "vue";
import Chart from "chart.js/auto";
import LoaderComponent from "@/components/LoaderComponent.vue";
import { VITE_API_ENDPOINT } from "@/utils/const";
import TitleComponent from "@/components/TitleComponent.vue";
import BarChart from "@/components/AreaChartComponent.vue";
import { useLoginStore } from "@/stores/loginStore";
import axios from "axios";

const period = ref("day");
const stats = ref([]);
const error = ref(null);
const totalProducts = ref(0);
const totalOrders = ref(0);
const loading = ref(false);
const totalRevenueAmount = ref();
const ordersByMonthArray = ref([]);
const revenueByMonthArray = ref([]);
const totalUsers = ref()
let chart = null;

const { isAuthenticated, token } = useLoginStore()

const fetchStats = async () => {
  if (!isAuthenticated) return
  error.value = null;
  loading.value = true;

  try {
    const { data } = await axios.get(
      `${VITE_API_ENDPOINT}/admin/stats/?period=${period.value}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );


    stats.value = data.stats;
    totalProducts.value = data.totalVariants
    totalOrders.value = data.totalOrders;
    totalUsers.value = data.totalUsers;
    totalRevenueAmount.value = data.totalRevenueAmount;
    ordersByMonthArray.value = data.ordersByMonthArray;
    revenueByMonthArray.value = data.revenueByMonthArray;

    setTimeout(() => renderChart(), 100);
  } catch (err) {
    console.error("Erreur:", err);
    error.value = `Erreur lors de la récupération des données: ${err.message}`;
  } finally {
    loading.value = false;
  }
};

// Render chart with Chart.js
const renderChart = () => {
  if (!stats.value?.length) return;

  const ctx = document.getElementById("usersChart")?.getContext("2d");
  if (!ctx) return;

  if (chart) {
    chart.destroy();
  }

  const periodLabels = {
    day: "15 derniers jours",
    month: "15 derniers mois",
    year: "15 dernières années",
  };

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: stats.value.map((entry) => entry.date),
      datasets: [
        {
          label: `Nombre d'inscription utilisateurs - ${periodLabels[period.value]}`,
          data: stats.value.map((entry) => entry.userCount),
          borderColor: "rgba(75, 192, 192, 1)",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          fill: true,
          tension: 0.1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          title: { display: true, text: "Date" },
        },
        y: {
          title: { display: true, text: "Nombre d'inscription utilisateurs" },
          beginAtZero: true,
        },
      },
    },
  });
};


// Initialize data and charts on mount
onMounted(async () => {
  try {
    await fetchStats();
  } catch (error) {
    console.log(error);

  }
});

// Watch for period changes to fetch new stats
watch(period, fetchStats);
</script>
