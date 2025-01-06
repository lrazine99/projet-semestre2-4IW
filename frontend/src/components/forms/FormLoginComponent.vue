<template>
  <div class="transform transition-all hover:scale-105 p-6 space-y-4 md:space-y-6 bg-white sm:p-8 w-[100%]">
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
import { VITE_API_ENDPOINT } from '@/utils/const';
import { toast } from 'vue3-toastify';

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
    const { data } = await axios.post(`${VITE_API_ENDPOINT}/user/login`, formData, { signal });

    loginStore.login(data?.token, data?.role);

    const cartStore = useCartStore();
    await cartStore.syncCartWithBackend(loginStore.isAuthenticated);
    await cartStore.loadCart();

    router.push('/produits');
  } catch (error) {
    
  toast(error.response.data.message, {
    autoClose: 1000,
  }); // ToastOptions

    throw error;
  }
}
</script>
