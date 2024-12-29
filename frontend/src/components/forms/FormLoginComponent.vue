<template>
  <div class="p-6 space-y-4 md:space-y-6 bg-white sm:p-8 w-[100%]">
    <FormComponent :fields="loginFields" :validationSchema="loginSchema" :handleSubmit="handleLogin"
      submitButtonText="Connexion" />
    <a href="/demande-reinitialiser-mot-de-passe" class="text-sm text-primary-600 hover:underline">Mot de passe oublié
      ?</a>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { z } from 'zod';
import FormComponent from '../FormComponent.vue';
import axios from 'axios';
import { useCartStore } from '@/stores/cartStore';
import { useLoginStore } from '@/stores/loginStore';
import { API_ENDPOINT } from '@/utils/const';

const router = useRouter();
const loginStore = useLoginStore();

const loginFields = [
  { id: 'email', label: 'Email', type: 'email', placeholder: 'Entrez votre email' },
  {
    id: 'password',
    label: 'Mot de Passe',
    type: 'password',
    placeholder: 'Entrez votre mot de passe'
  }
]

const loginSchema = z.object({
  email: z.string().min(1, 'Email requis').email('Email incorrect'),
  password: z.string().regex(/^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/, {
    message: "Le mot de passe doit contenir au moins 6 caractères, une majuscule, un chiffre et un caractère spécial."
  })
})

const handleLogin = async (formData, signal) => {
  try {
    const { data } = await axios.post(`${API_ENDPOINT}/user/login`, formData, { signal });

    loginStore.login(data?.token);

    alert('Connexion réussie');

    const cartStore = useCartStore();
    await cartStore.syncCartWithBackend(loginStore.isAuthenticated);

    window.dispatchEvent(new Event('auth-changed'));

    router.push('/product');
  } catch (error) {
    alert(error.response.data.message);
    throw error;
  }
}
</script>
