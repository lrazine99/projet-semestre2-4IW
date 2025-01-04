<template>
    <div class="p-6 space-y-4 md:space-y-6 bg-white sm:p-8 mx-auto w-[100%] mt-6">
        <FormComponent :fields="createUserFields" :validationSchema="createUserSchema" :handleSubmit="handleSubmit"
            submitButtonText="Valider" />
    </div>
</template>

<script setup>
import { z } from 'zod'
import FormComponent from '../FormComponent.vue'

const { handleSubmit } = defineProps({
    handleSubmit: {
        type: Function,
        required: true
    }
})

const createUserFields = [
    { id: 'firstName', label: 'First Name', type: 'text', placeholder: 'Entrez prénom' },
    { id: 'lastName', label: 'Last Name', type: 'text', placeholder: 'Entrez nom de famille' },
    { id: 'email', label: 'Email', type: 'email', placeholder: 'Entrez email' }
]

const createUserSchema = z.object({
    firstName: z.string().min(1, 'Prénom requis'),
    lastName: z.string().min(1, 'Nom de famille requis'),
    email: z.string().min(1, 'Email requis').email('Email incorrect'),
})


</script>