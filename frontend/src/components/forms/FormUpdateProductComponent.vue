<template>
    <div class="p-6 space-y-4 md:space-y-6 bg-white sm:p-8 mx-auto w-[100%] mt-6">
        <FormComponent
            :fields="updateProductFields"
            :validationSchema="updateProductSchema"
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



const updateProductFields = [
    { id: 'name', label: 'Nom du produit', type: 'text', placeholder: 'Entrez le nom du produit' },
    { id: 'description', label: 'Description', type: 'text', placeholder: 'Entrez une description du produit' },
    { id: 'genres', label: 'Genres', type: 'text', placeholder: 'Entrez les genres (séparés par des virgules)' },
    { id: 'minAge', label: 'Âge Minimum', type: 'number', placeholder: 'Entrez l\'âge minimum' },
    { id: 'editor', label: 'Éditeur', type: 'text', placeholder: 'Entrez l\'éditeur' },
]

const updateProductSchema = z.object({
    name: z.string().min(1, 'Nom du produit requis'),
    description: z.string().min(1, 'Description requise'),
    genres: z.string().min(1, 'Genres requis'),
    minAge: z.number().min(0, 'Âge minimum invalide').int('L\'âge doit être un nombre entier'),
    editor: z.string().min(1, 'Éditeur requis'),
})


</script>
