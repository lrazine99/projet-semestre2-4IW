<template>
  <div class="p-6 space-y-4 md:space-y-6 bg-white sm:p-8 mx-auto w-[80%] md:w-[60%] mt-6">
    <FormComponent :fields="loginFields" :validationSchema="loginSchema" :handleSubmit="handleLogin"
      submitButtonText="Envoyer" />
  </div>
</template>

<script setup>
import { z } from 'zod'
import FormComponent from '../FormComponent.vue'
import axios from 'axios'
import { useRouter } from 'vue-router';
import { VITE_API_ENDPOINT } from '@/utils/const';
import { toast } from 'vue3-toastify';

const props = defineProps({
  emailUser: {
    type: String,
    required: true
  }
})

const emailUser = props.emailUser;


const loginFields = [
  {
    id: 'password',
    label: 'Mot de Passe',
    type: 'password',
    placeholder: 'Entrez votre mot de passe'
  },
  {
    id: 'confirmPassword',
    label: 'Confirmer le mot de passe',
    type: 'password',
    placeholder: 'Confirmez votre mot de passe'
  }

]

const loginSchema = z.object({
  password: z.string().regex(/^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/, {
    message: "Le mot de passe doit contenir au moins 6 caractères, une majuscule, un chiffre et un caractère spécial."
  }),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword,
  {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword']
  })

const router = useRouter();
const handleLogin = async ({ password }, signal) => {
  try {
    await axios.post(`${VITE_API_ENDPOINT}/user/edit-password`, { password, email: emailUser }, {
      signal
    })

    toast.success('Modification du mot de passe réussie', {
      autoClose: 1000,
      onClose: () => {
        router.push('/inscription-connexion/#connexion');
      }
    });
  } catch (error) {
    console.error('Login error:', error)
  }
}
</script>
