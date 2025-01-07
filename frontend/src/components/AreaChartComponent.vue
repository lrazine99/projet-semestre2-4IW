<template>
    <Bar id="my-chart-id" :options="chartOptions" :data="chartData" />
</template>

<script setup>
import { ref } from 'vue'
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)


const { dataSets, labelTitle } = defineProps({
    dataSets: {
        type: Object,
        required: true
    },
    labelTitle: {
        type: String,
        required: true
    }
})



const chartData = ref({
    labels: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
    datasets: [{
        data: dataSets,
        label : labelTitle,
    }]
})

const chartOptions = ref({
    responsive: true
})
</script>
