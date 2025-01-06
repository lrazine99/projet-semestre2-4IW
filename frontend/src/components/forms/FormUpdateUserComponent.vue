<template>
    <div class="p-6 space-y-4 md:space-y-6 bg-white sm:p-8 mx-auto w-[100%] mt-6">
        <FormComponent
            :fields="updateUserFields"
            :validationSchema="updateUserSchema"
            :handleSubmit="handleSubmit"
            :formData="product" 
            submitButtonText="Valider"
        />
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { z } from 'zod'
import FormComponent from '../FormComponent.vue'

const props = defineProps({
  handleSubmit: {
    type: Function,
    required: true
  },
  initialValues: {
    type: Object,
    default: () => ({})
  }
})
const product = ref({ ...props.initialValues });



const updateUserFields = [
    { id: 'firstName', label: 'prénom', type: 'text', placeholder: 'Entrez le prénom' },
    { id: 'lastName', label: 'nom', type: 'text', placeholder: 'Entrez un nom' },
    { id: 'email', label: 'email', type: 'text', placeholder: 'Entrez un email' },
    { id: 'role', label: 'rôle', type: 'text', placeholder: 'Entrez le rôle' },
]

const updateUserSchema = z.object({
    firstName: z.string().min(1, 'Le prénom est requis'),
    lastName: z.string().min(1, 'Le nom est requis'),
    email: z.string().email('L\'email est invalide').min(1, 'L\'email est requis'),
    role: z.string().min(1, 'Le rôle est requis'),
})



</script>
