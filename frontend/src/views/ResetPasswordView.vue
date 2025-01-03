<!-- eslint-disable vue/multi-word-component-names -->
<template>
    <div class="my-[10rem]">
        <TitleComponent titleText="Réinitialiser votre mot de passe" />
        <div v-if="isLoading">Loading...</div>
        <div v-else>
            <FormResetPasswordComponent :emailUser="emailUser" />
        </div>
    </div>
</template>

<script setup>
import FormResetPasswordComponent from '@/components/forms/FormResetPasswordComponent.vue';
import TitleComponent from '@/components/TitleComponent.vue';
import AbortControllerManager from '@/controllers/AbortControllerManager';
import { getTokenUrl } from '@/utils/auth';
import { VITE_API_ENDPOINT } from '@/utils/const';
import axios from 'axios';
import { onBeforeMount, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const emailUser = ref('');
const isLoading = ref(true);
const decoratedAbort = new AbortControllerManager();

onBeforeMount(async () => {
    const tokenReset = getTokenUrl();

    try {
        const { data } = await axios.get(`${VITE_API_ENDPOINT}/user/check-token-reset/${tokenReset} `, {
            signal: decoratedAbort.signal
        });

        emailUser.value = data.email;
        isLoading.value = false;
    } catch (error) {
        router.push('/404');
        alert('Token invalide');
    }
});

onUnmounted(() => {
    decoratedAbort.abort()
})
</script>