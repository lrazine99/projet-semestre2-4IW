<template>
  <div class="my-[10rem]">
    <TitleComponent titleText="Confirmation du compte" />

        <FormResendConfirm v-if="showResendConfirmationForm" />

    </div>
</template>

<script setup>
import { getTokenUrl, isUserLoggedIn } from '@/utils/auth';
import { ref, onUnmounted, onBeforeMount } from 'vue'
import axios from 'axios';
import router from '@/router';
import TitleComponent from '@/components/TitleComponent.vue';
import FormResendConfirm from '@/components/forms/FormResendConfirm.vue';
import AbortControllerManager from '@/controllers/AbortControllerManager';

const showResendConfirmationForm = ref(false);
const decoratedAbort = new AbortControllerManager();

const handleEmailConfirmation = async () => {
    try {
        const token = getTokenUrl();

        const { data } = await axios.get(`http://localhost:8080/confirm-email/${token}`, {
            signal: decoratedAbort.signal
        });
        
        localStorage.setItem('authToken', data.message.token);

        alert('compte verifié');

        router.push('/login');
    } catch (error) {
        if (error.response && error.response.status === 400) {
            alert('token invalid ou expiré');

        } 

        showResendConfirmationForm.value = true;
    }
}

onBeforeMount(() => {
    if (isUserLoggedIn()) {
        router.push('/product');
    }

    handleEmailConfirmation();
})


onUnmounted(() => {
    decoratedAbort.abort()
})
</script>