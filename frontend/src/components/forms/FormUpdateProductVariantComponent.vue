<template>
    <div class="p-6 space-y-4 md:space-y-6 bg-white sm:p-8 mx-auto w-[100%] mt-6">
        <FormComponent 
            :fields="createProductVariantFields" 
            :validationSchema="createProductVariantSchema" 
            :handleSubmit="handleSubmit"
            :formData="formData"
            submitButtonText="Valider" 
        />

        <div v-if="generalError" class="text-red-600 text-sm mt-4">
            {{ generalError }}
        </div>
    </div>
</template>

<script setup>
import { z } from 'zod';
import FormComponent from '../FormComponent.vue';
import { ref, onMounted, watch } from 'vue';
import axios from 'axios';
import { VITE_API_ENDPOINT } from '@/utils/const';

const props = defineProps({
    productId: {
        type: String,
        required: true
    },
    variantId: {
        type: String,
        required: true
    },
    initialValues: {
        type: Object,
        required: true
    },
    handleSubmit: {
        type: Function,
        required: true
    }
});

const formData = ref(props.initialValues);
const platforms = ref([]);
const generalError = ref(''); 

// S'assurer que les données sont mises à jour si initialValues change
watch(() => props.initialValues, (newValues) => {
  formData.value = { ...newValues };
}, { deep: true });

const createProductVariantFields = ref([
    { 
        id: 'platform', 
        label: 'Plateforme', 
        type: 'select', 
        placeholder: 'Sélectionnez une plateforme',
        options: []
    },
    { id: 'name', label: 'Nom', type: 'text', placeholder: 'Entrez le nom du variant' },
    { id: 'edition', label: 'Édition', type: 'text', placeholder: 'Entrez l\'édition' },
    { id: 'price', label: 'Prix', type: 'number', placeholder: 'Entrez le prix' },
    { id: 'stock', label: 'Stock', type: 'number', placeholder: 'Entrez le stock' },
    { id: 'releaseDate', label: 'Date de sortie', type: 'date', placeholder: 'Entrez la date de sortie' },
    { id: 'barcode', label: 'Code-barres', type: 'text', placeholder: 'Entrez le code-barres' },
    { id: 'images', label: 'URL de l\'image', type: 'text', placeholder: 'Entrez l\'URL de l\'image du variant' }

]);

const createProductVariantSchema = z.object({
    platform: z.string().min(1, 'La plateforme est requise'),
    name: z.string().min(1, 'Le nom est requis'),
    edition: z.string().min(1, 'L\'édition est requise'),
    price: z.number().min(1, 'Le prix est requis')
        .transform(val => Number(val))
        .refine(val => !isNaN(val), 'Le prix doit être un nombre')
        .refine(val => val >= 0, 'Le prix doit être positif'),
    stock: z.number().min(1, 'Le stock est requis')
        .transform(val => Number(val))
        .refine(val => !isNaN(val), 'Le stock doit être un nombre')
        .refine(val => val >= 0, 'Le stock doit être positif'),
    releaseDate: z.string().min(1, 'La date de sortie est requise'),
    barcode: z.string().min(1, 'Le code-barres est requis'),
    images: z.string()
        .transform(val => val ? [val] : [])
});

const fetchPlatforms = async () => {
    try {
        const response = await axios.get(`${VITE_API_ENDPOINT}/product/platforms`);
        platforms.value = response.data.map(platform => ({
            value: platform._id,
            label: platform.name,
        }));
        
        const platformField = createProductVariantFields.value.find(field => field.id === 'platform');
        if (platformField) {
            platformField.options = platforms.value;
        }
    } catch (error) {
        console.error('Erreur lors de la récupération des plateformes:', error);
        generalError.value = "Erreur lors du chargement des plateformes";
    }
};

onMounted(() => {
    fetchPlatforms();
});
</script>