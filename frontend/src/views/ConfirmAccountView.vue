<template>
    <div class="my-[10rem]">
        <TitleComponent titleText="Confirmation du compte" />

        <FormResendConfirm v-if="showResendConfirmationForm" />

    </div>
</template>

<script setup>
import { getTokenUrl } from '@/utils/auth';
import { ref, onUnmounted, onBeforeMount } from 'vue'
import axios from 'axios';
import router from '@/router';
import TitleComponent from '@/components/TitleComponent.vue';
import FormResendConfirm from '@/components/forms/FormResendConfirm.vue';
import AbortControllerManager from '@/controllers/AbortControllerManager';
import { useLoginStore } from '@/stores/loginStore';
import { VITE_API_ENDPOINT } from '@/utils/const';
import { toast } from 'vue3-toastify';

const showResendConfirmationForm = ref(false);
const decoratedAbort = new AbortControllerManager();
const loginStore = useLoginStore();

const handleEmailConfirmation = async () => {
    try {
        const token = getTokenUrl();

        const { data } = await axios.get(`${VITE_API_ENDPOINT}/user/confirm-email/${token}`, {
            signal: decoratedAbort.signal
        });

        loginStore.login(data.message.token);
        toast.success('Compte verifié', {
            autoClose: 1000,
        });

        router.push('/login');
    } catch (error) {
        if (error.response && error.response.status === 400) {
            toast.success('Token invalid ou expiré', {
        autoClose: 1000,
    });

        }

        showResendConfirmationForm.value = true;
    }
}

onBeforeMount(() => {
    if (loginStore.isAuthenticated) {
        router.push('/produits');
    }

    handleEmailConfirmation();
})


onUnmounted(() => {
    decoratedAbort.abort()
})
</script>