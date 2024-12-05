<template>
  <div class="p-6 space-y-4 md:space-y-6 bg-white sm:p-8 w-[100%]">

    <FormComponent :fields="fields" :submitButtonText="'Inscription'" :handleSubmit="handleSignUp"
      :validationSchema="signUpSchema" />
  </div>
</template>

<script setup>
import axios from 'axios'
import { z } from 'zod'
import FormComponent from '../FormComponent.vue'

const fields = [
  {
    id: 'firstName',
    label: 'Prénom',
    type: 'text',
    placeholder: 'Entrez votre prénom',
    required: true
  },
  {
    label: 'Nom',
    id: 'lastName',
    type: 'text',
    placeholder: 'Entrez votre nom'
  },
  {
    label: 'Email',
    id: 'email',
    type: 'email',
    placeholder: 'Entrez votre email'
  },
  {
    label: 'Mot de Passe',
    id: 'password',
    type: 'password',
    placeholder: 'Entrez votre mot de passe'
  }
]

const signUpSchema = z.object({
  firstName: z.string().min(1, 'Prénom requis'),
  lastName: z.string().min(1, 'Nom requis'),
  email: z.string().email('Email invalide').min(1, 'Email requis'),
  password: z.string().regex(/^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/, {
    message: "Le mot de passe doit contenir au moins 6 caractères, une majuscule, un chiffre et un caractère spécial."
  })
})

const handleSignUp = async (formData, signal) => {
  const { firstName, lastName, email, password } = formData
  try {
    await axios.post('http://localhost:8080/user/signup', {
      firstName,
      lastName,
      email,
      password
    }, { signal })


    alert('Inscription réussie ! Un email de confirmation vous a été envoyé')
  } catch (error) {
    alert( error.response.data.message)
    throw error;
  }
}
</script>
