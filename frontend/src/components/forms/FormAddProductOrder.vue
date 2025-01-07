<template>
    <div class="p-6 space-y-4 md:space-y-6 bg-white sm:p-8 mx-auto w-[100%] mt-6">
      <FormComponent
        :fields="formFields"
        :validationSchema="validationSchema"
        :handleSubmit="handleSubmit"
        submitButtonText="Ajouter"
      />
    </div>
   </template>
   
   <script setup>
   import { z } from 'zod';
   import { ref, onMounted } from 'vue';
   import axios from 'axios';
   import FormComponent from '../FormComponent.vue';
   import { VITE_API_ENDPOINT } from '@/utils/const';
   
   const props = defineProps({
    handleSubmit: {
      type: Function,
      required: true
    }
   });
   
   const variants = ref([]);
   
   const formFields = ref([
    {
      id: 'productVariant',
      label: 'Produit',
      type: 'select',
      placeholder: 'Sélectionnez un produit',
      options: []
    },
    {
      id: 'quantity',
      label: 'Quantité',
      type: 'number',
      placeholder: 'Entrez la quantité'
    }
   ]);
   
   const validationSchema = z.object({
    productVariant: z.string().min(1, 'Le produit est requis'),
    quantity: z.number()
      .min(1, 'La quantité doit être supérieure à 0')
      .transform(val => Number(val))
   });
   
   const fetchVariants = async () => {
  try {
    const response = await axios.get(`${VITE_API_ENDPOINT}/product`);
    const platforms = response.data.platforms;
    
    // Créer un map des plateformes pour un accès facile
    const platformMap = Object.fromEntries(
      platforms.map(platform => [platform._id, platform.name])
    );
    
    // Transformer les produits et leurs variantes en options
    const options = response.data.productsFound.flatMap(product =>
      product.variants.map(variant => ({
        value: variant.sku,
        label: `${product.name} - ${variant.name} (${platformMap[variant.platform] || 'N/A'})`
      }))
    );
    
    const productField = formFields.value.find(field => field.id === 'productVariant');
    if (productField) {
      productField.options = options;
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des variantes:', error);
  }
};
   
   onMounted(() => {
    fetchVariants();
   });
   </script>