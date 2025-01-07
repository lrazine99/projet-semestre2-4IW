<template>
  <div class="p-6 space-y-4 md:space-y-6 bg-white sm:p-8 mx-auto w-[30%] mt-6">

    <FormComponent :fields="loginFields" :validationSchema="loginSchema" :handleSubmit="handleLogin"
      submitButtonText="Envoyer" />
  </div>
</template>

<script setup>
import { z } from 'zod'
import FormComponent from '../FormComponent.vue'
import axios from 'axios'
import { VITE_API_ENDPOINT } from '@/utils/const'
import { toast } from 'vue3-toastify';

const loginFields = [
  { id: 'email', label: 'Email', type: 'email', placeholder: 'Entrez votre email' }
]

const loginSchema = z.object({
  email: z.string().min(1, 'Email requis').email('Email incorrect'),
})

const handleLogin = async (formData, signal) => {
  
  try {
    await axios.post(`${VITE_API_ENDPOINT}/user/reset-password`, formData, {
      signal
    })
    
    toast.success('Si un compte avec cet email existe, un email de réinitialisation de mot de passe vous sera envoyé', {
        autoClose: 1000,
    });
  } catch (error) {
    console.log(error);
    toast.success('Erreur lors de l\'envoie', {
        autoClose: 1000,
    });
  }
}
</script>
