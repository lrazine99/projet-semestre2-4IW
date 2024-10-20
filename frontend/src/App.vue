<template>
    <div id="app">
        <h1>Sample API Call with Axios</h1>
        <button @click="fetchData">Fetch Dataj</button>
        <div v-if="error">{{ error }}</div>
        <div v-if="data">{{ data }}</div>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    name: 'App',
    data() {
        return {
            data: null,
            error: null,
        };
    },
    methods: {
        async fetchData() {
            try {
                const response = await axios.get('http://localhost:8080/');
                this.data = response.data;
                console.log(response);
                
            } catch (error) {
                this.error = 'An error occurred while fetching data';
                console.error(error);
            }
        },
    },
};
</script>

<style scoped>
#app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    text-align: center;
    color: #2c3e50;
    margin-top: 60px;
}
</style>