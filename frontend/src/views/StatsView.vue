<template>
    <div class="stats-container max-w-7xl mx-auto px-4 py-8">
      <h1 class="text-3xl font-semibold text-center text-gray-800 mb-6">Statistiques des Utilisateurs</h1>
  
      <div class="controls flex justify-center mb-6">
        <div class="period-selector flex items-center space-x-4">
          <label for="period" class="text-lg font-medium text-gray-700">Période :</label>
          <select id="period" v-model="period" @change="fetchStats" class="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
            <option value="day">15 derniers jours</option>
            <option value="month">15 derniers mois</option>
            <option value="year">15 dernières années</option>
          </select>
        </div>
      </div>
  
      <div v-if="error" class="error-message text-red-600 border border-red-600 rounded-lg p-4 mb-6 bg-red-100">
        {{ error }}
      </div>
  
      <div v-if="loading" class="loading text-center text-lg text-gray-600 mb-6">
        Chargement des données...
      </div>
  
      <div v-if="!loading && !error" class="chart-container bg-white p-6 rounded-lg shadow-lg">
        <canvas id="usersChart"></canvas>
      </div>
    </div>
  </template>
  
  
  <script setup>
  import { ref, onMounted, watch } from 'vue';
  import Chart from 'chart.js/auto';
  
  const period = ref("day");
  const stats = ref([]);
  const error = ref(null);
  const loading = ref(false);
  let chart = null;
  
  const fetchStats = async () => {
  error.value = null;
  loading.value = true;

  try {
    const response = await fetch(
      `http://localhost:8080/admin/stats/new-users?period=${period.value}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    stats.value = data.stats;

    setTimeout(() => {
      renderChart();
    }, 100);
  } catch (err) {
    console.error("Erreur:", err);
    error.value = "Erreur lors de la récupération des données: " + err.message;
  } finally {
    loading.value = false;
  }
};

  
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
      year: "15 dernières années"
    };
  
    chart = new Chart(ctx, {
      type: "line",
      data: {
        labels: stats.value.map(entry => entry.date),
        datasets: [{
          label: `Nombre d'utilisateurs - ${periodLabels[period.value]}`,
          data: stats.value.map(entry => entry.userCount),
          borderColor: "rgba(75, 192, 192, 1)",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          fill: true,
          tension: 0.1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            title: {
              display: true,
              text: "Date"
            }
          },
          y: {
            title: {
              display: true,
              text: "Nombre d'utilisateurs"
            },
            beginAtZero: true
          }
        }
      }
    });
  };
  
  onMounted(() => {
    fetchStats();
  });
  
  watch(period, () => {
    fetchStats();
  });
  </script>
  
  <style scoped>
  .stats-container {
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .controls {
    display: flex;
    justify-content: center;
    margin: 20px 0;
  }
  
  .error-message {
    color: red;
    margin: 10px 0;
    padding: 10px;
    border: 1px solid red;
    border-radius: 4px;
  }
  
  .loading {
    text-align: center;
    margin: 20px 0;
  }
  
  .chart-container {
    height: 400px;
    margin-top: 20px;
    padding: 15px;
    border: 1px solid #ddd;
    border-radius: 8px;
    background-color: white;
  }
  
  .period-selector {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  select {
    padding: 5px;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  </style>