<template>
    <div v-for="(order) in orders" :key="order._id" class="bg-white shadow-lg rounded-lg p-6 m-1">
        <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-semibold">Commande {{ order.invoiceNumber }}</h2>
        </div>
        <div>
            <div class="space-y-4">
                <div 
                    v-for="item in order.products" 
                    :key="item.productSku" 
                    class="flex justify-between items-center border-b border-gray-200 pb-2"
                >
                    <div class="font-medium text-gray-800">{{ item.productName }}</div>
                    <div class="text-gray-600">x{{ item.quantity }}</div>
                    <div class="text-gray-800">{{ item.price }} €</div>
                </div>
            </div>
            <div class="flex justify-between items-center mt-6 pt-4 border-t border-gray-300">
                <div class="text-lg font-semibold">Total</div>
                <div class="text-lg font-semibold text-gray-900">{{ order?.total }} €</div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { VITE_API_ENDPOINT } from '@/utils/const';
import { onBeforeMount } from 'vue';
import axios from 'axios';
import { useLoginStore } from '@/stores/loginStore';
import { toast } from 'vue3-toastify';
import { ref } from 'vue';

const { isAuthenticated, token } = useLoginStore();
const orders = ref([]);
const totalPrice = ref(0);



onBeforeMount(async () => {
    if (!isAuthenticated) {
        toast.error('Vous devez être connecté pour accéder à cette page');
        return;
    }

    const { data } = await axios.get(`${VITE_API_ENDPOINT}/order/getByUser`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    console.log(data);
    
    
    orders.value = data;


});
</script>