<template>
    <div class="p-6 space-y-4 md:space-y-6 bg-white sm:p-8 mx-auto w-[100%] mt-6">
        <FormComponent 
            :fields="createProductVariantFields" 
            :validationSchema="createProductVariantSchema" 
            :handleSubmit="onSubmit"
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
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { VITE_API_ENDPOINT } from '@/utils/const';

const platforms = ref([]);
const products = ref([]);
const generalError = ref(''); 

const createProductVariantFields = ref([
    {
        id: 'product',
        label: 'Produit',
        type: 'select',
        placeholder: 'Sélectionnez un produit',
        options: []
    },
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
    { id: 'image', label: 'URL de l\'image', type: 'text', placeholder: 'Entrez l\'URL de l\'image du variant' }, 
]);

const createProductVariantSchema = z.object({
    product: z.string().min(1, 'Le produit est requis'),
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
});

const fetchProducts = async () => {
    try {
        const response = await axios.get(`${VITE_API_ENDPOINT}/product`);
        console.log('Response products:', response.data);
        
        if (Array.isArray(response.data.productsFound)) {
            const mappedProducts = response.data.productsFound.map(product => ({
                value: product._id,
                label: product.name,
            }));
            console.log('Mapped products:', mappedProducts);
            
            const productField = createProductVariantFields.value.find(field => field.id === 'product');
            if (productField) {
                productField.options = mappedProducts;
            }
        } else {
            generalError.value = "Les produits n'ont pas été trouvés dans la réponse de l'API.";
        }
    } catch (error) {
        console.error('Erreur lors de la récupération des produits:', error);
        generalError.value = "Erreur lors du chargement des produits";
    }
};

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

const onSubmit = async (formData) => {
    try {
        console.log('Form data received:', formData);

        // On prépare les données de la variante en excluant le champ 'product'
        const variantData = {
            platformId: formData.platform,
            name: formData.name,
            edition: formData.edition,
            price: formData.price,
            stock: formData.stock,
            releaseDate: formData.releaseDate,
            barcode: formData.barcode,
            image: formData.image
        };

        // On utilise directement l'ID du produit depuis formData.product
        const response = await axios.post(
            `${VITE_API_ENDPOINT}/product/${formData.product}/variant`,
            variantData
        );

        if (response.status === 201) {
            console.log('Variante créée avec succès:', response.data);
            // Réinitialiser le formulaire ou rediriger l'utilisateur
        }
    } catch (error) {
        console.error('Erreur lors de la création de la variante:', error);
        generalError.value = "Erreur lors de la création de la variante";
    }
};

onMounted(() => {
    fetchProducts();
    fetchPlatforms();
});
</script>