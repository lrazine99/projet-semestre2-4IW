<template>
    <div class="p-6 space-y-4 md:space-y-6 bg-white sm:p-8 mx-auto w-[100%] mt-6">
        <div class="space-y-4">
            <h3 class="text-lg font-semibold">Informations du produit</h3>
            <div class="grid grid-cols-4 gap-4">
                <div v-for="field in mainProductFields" :key="field.id" class="col-span-2">
                    <label :for="field.id" class="block text-sm font-medium text-gray-700 mb-1">
                        {{ field.label }}
                    </label>
                    <input
                        :id="field.id"
                        v-model="formData[field.id]"
                        :type="field.type"
                        :placeholder="field.placeholder"
                        class="w-full p-2 border rounded-md"
                        :class="{ 'border-red-500': errors[field.id] }"
                    >
                    <p v-if="errors[field.id]" class="mt-1 text-sm text-red-600">
                        {{ errors[field.id] }}
                    </p>
                </div>
            </div>
        </div>

        <div class="space-y-4">
            <h3 class="text-lg font-semibold">Variants du produit</h3>
            <div v-for="(variant, index) in formData.variants" :key="index" 
    class="border p-4 mb-4 rounded-lg relative">
    <button 
        @click="removeVariant(index)"
        class="absolute top-2 right-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700"
        type="button"
    >
        Supprimer
    </button>
    
    <div class="grid grid-cols-4 gap-4 mt-6">
        <div v-for="field in variantFields" :key="field.id" class="col-span-2">
            <label :for="`${field.id}-${index}`" class="block text-sm font-medium text-gray-700 mb-1">
                {{ field.label }}
            </label>
            <template v-if="field.type === 'select'">
                <select
                    :id="`${field.id}-${index}`"
                    v-model="variant[field.id]"
                    class="w-full p-2 border rounded-md"
                    :class="{ 'border-red-500': variantErrors[index]?.[field.id] }"
                >
                    <option value="">Sélectionnez une option</option>
                    <option 
                        v-for="option in platforms" 
                        :key="option.value" 
                        :value="option.value"
                    >
                        {{ option.label }}
                    </option>
                </select>
            </template>
            <template v-else>
                <input
                    :id="`${field.id}-${index}`"
                    v-model="variant[field.id]"
                    :type="field.type"
                    :placeholder="field.placeholder"
                    class="w-full p-2 border rounded-md"
                    :class="{ 'border-red-500': variantErrors[index]?.[field.id] }"
                >
            </template>
            <p v-if="variantErrors[index]?.[field.id]" class="mt-1 text-sm text-red-600">
                {{ variantErrors[index][field.id] }}
            </p>
        </div>
    </div>
</div>
            <button 
                @click="addVariant"
                type="button"
                class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
                Ajouter une variant
            </button>
        </div>

        <div v-if="generalError" class="text-red-600 text-sm mb-4">
            {{ generalError }}
        </div>

        <button 
            @click="submitForm"
            class="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
            Enregistrer le produit
        </button>
    </div>
</template>
  
<script setup>
import { ref, onMounted } from 'vue';
import { z } from 'zod';
import axios from 'axios';
import { VITE_API_ENDPOINT } from '@/utils/const';

const props = defineProps({
    handleSubmit: {
        type: Function,
        required: true,
    }
});

const formData = ref({
    name: '',
    description: '',
    genres: '',
    minAge: '',
    editor: '',
    variants: []
});

const platforms = ref([]);
const errors = ref({});
const variantErrors = ref([]);
const generalError = ref('');

const productSchema = z.object({
    name: z.string().min(1, 'Le nom du produit est requis'),
    description: z.string().min(1, 'La description est requise'),
    genres: z.string().min(1, 'Au moins un genre est requis'),
    minAge: z.number().min(1, 'L\'âge minimum est requis')
        .transform(val => Number(val))
        .refine(val => !isNaN(val), 'L\'âge doit être un nombre')
        .refine(val => val >= 0, 'L\'âge doit être positif'),
    editor: z.string().min(1, 'L\'éditeur est requis'),
});

const variantSchema = z.object({
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
    images: z.string().min(1, 'Une image est requise'),
});

const fullSchema = z.object({
    product: productSchema,
    variants: z.array(variantSchema).min(1, 'Au moins un variant est requis'),
});

const mainProductFields = [
    { id: 'name', label: 'Nom du produit', type: 'text', placeholder: 'Entrez le nom du produit' },
    { id: 'description', label: 'Description', type: 'text', placeholder: 'Entrez une description du produit' },
    { id: 'genres', label: 'Genres', type: 'text', placeholder: 'Entrez les genres (séparés par des virgules)' },
    { id: 'minAge', label: 'Âge Minimum', type: 'number', placeholder: 'Entrez l\'âge minimum' },
    { id: 'editor', label: 'Éditeur', type: 'text', placeholder: 'Entrez l\'éditeur' },
];

const variantFields = [
    { 
        id: 'platform', 
        label: 'Plateforme', 
        type: 'select', 
        placeholder: 'Sélectionnez la plateforme'
    },
    { id: 'name', label: 'Nom', type: 'text', placeholder: 'Entrez le nom du variant' },
    { id: 'edition', label: 'Édition', type: 'text', placeholder: 'Entrez l\'édition' },
    { id: 'price', label: 'Prix', type: 'number', placeholder: 'Entrez le prix' },
    { id: 'stock', label: 'Stock', type: 'number', placeholder: 'Entrez le stock' },
    { id: 'releaseDate', label: 'Date de sortie', type: 'date', placeholder: 'Entrez la date de sortie' },
    { id: 'barcode', label: 'Code-barres', type: 'text', placeholder: 'Entrez le code-barres' },
    { id: 'images', label: 'URL de l\'image', type: 'text', placeholder: 'Entrez l\'URL de l\'image du variant' },
];

const addVariant = () => {
    formData.value.variants.push({
        platform: '',
        name: '',
        edition: '',
        price: '',
        stock: '',
        releaseDate: '',
        barcode: '',
    });
    variantErrors.value.push({});
};

const removeVariant = (index) => {
    formData.value.variants.splice(index, 1);
    variantErrors.value.splice(index, 1);
};

const validateForm = () => {
    try {
        errors.value = {};
        variantErrors.value = Array(formData.value.variants.length).fill({});
        generalError.value = '';

        fullSchema.parse({
            product: {
                name: formData.value.name,
                description: formData.value.description,
                genres: formData.value.genres,
                minAge: formData.value.minAge,
                editor: formData.value.editor,
            },
            variants: formData.value.variants,
        });

        return true;
    } catch (error) {
        if (error instanceof z.ZodError) {
            error.errors.forEach(err => {
                const path = err.path;
                if (path[0] === 'product') {
                    errors.value[path[1]] = err.message;
                } else if (path[0] === 'variants') {
                    const variantIndex = path[1];
                    const field = path[2];
                    if (!variantErrors.value[variantIndex]) {
                        variantErrors.value[variantIndex] = {};
                    }
                    variantErrors.value[variantIndex][field] = err.message;
                } else {
                    generalError.value = err.message;
                }
            });
        } else {
            generalError.value = "Une erreur est survenue lors de la validation";
        }
        return false;
    }
};

const submitForm = async () => {
    if (!validateForm()) {
        return;
    }

    try {
        const productData = {
            name: formData.value.name,
            description: formData.value.description,
            genres: formData.value.genres.split(',').map(g => g.trim()),
            minAge: Number(formData.value.minAge),
            editor: formData.value.editor,
            variants: formData.value.variants.map(variant => ({
                ...variant,
                price: Number(variant.price),
                stock: Number(variant.stock),
                images: [variant.image] 
            }))
        };

        await props.handleSubmit(productData);
    } catch (error) {
        generalError.value = "Une erreur est survenue lors de l'envoi du formulaire";
        console.error('Erreur lors de la soumission du formulaire:', error);
    }
};


const fetchPlatforms = async () => {
    try {
        const response = await axios.get(`${VITE_API_ENDPOINT}/product/platforms`);
        platforms.value = response.data.map(platform => ({
            value: platform._id,
            label: platform.name,
        }));
    } catch (error) {
        console.error('Erreur lors de la récupération des plateformes:', error);
        generalError.value = "Erreur lors du chargement des plateformes";
    }
};

onMounted(() => {
    fetchPlatforms();
});
</script>