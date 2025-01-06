<template>

  <div class="w-[90%] mx-auto m-4" v-if="firstName && lastName">

    <TitleComponent :titleText="`Bienvenue ${firstName} ${lastName}`"></TitleComponent>
    <AccordionComponent :accordionConfig="accordionConfig"></AccordionComponent>
  </div>

</template>

<script setup>
import AccordionComponent from '@/components/AccordionComponent.vue';
import FormAddressComponent from '@/components/forms/FormAddressComponent.vue';
import OrderBoxComponent from '@/components/OrderBoxComponent.vue';
import { useLoginStore } from '@/stores/loginStore';
import { VITE_API_ENDPOINT } from '@/utils/const';
import axios from 'axios';
import { onBeforeMount, ref } from 'vue';
import { toast } from 'vue3-toastify';
import TitleComponent from '@/components/TitleComponent.vue';

const accordionConfig = [
  {
    title: 'Mes informations personnelles',
    component: FormAddressComponent,
  },
  {
    title: 'Mes commandes',
    component: OrderBoxComponent,
  },
  
];

const lastName = ref('');
const firstName = ref('');

const { isAuthenticated, token } = useLoginStore();

onBeforeMount(async () => {
    if (isAuthenticated) {
        try {
            const { data } = await axios.get(`${VITE_API_ENDPOINT}/user/get-user`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            lastName.value = data.lastName;
            firstName.value = data.firstName;
        } catch (error) {
            console.log(error);

            toast.error('Erreur lors de la récupération de l\'adresse', {
                autoClose: 1000,
            }); // ToastOptions
        }
    }
});
</script>