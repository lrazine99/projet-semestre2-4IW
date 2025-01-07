<template>
    <div class="p-6 space-y-4 md:space-y-6 bg-white sm:p-8 mx-auto w-[100%] mt-6">
      <FormComponent
        :fields="fields"
        :validationSchema="validationSchema"
        :handleSubmit="handleSubmit"
        :formData="initialValues"
        submitButtonText="Valider"
      />
    </div>
   </template>
   
   <script setup>
   import { ref } from 'vue';
   import { z } from 'zod';
   import FormComponent from '../FormComponent.vue';
   
   const props = defineProps({
    handleSubmit: {
      type: Function,
      required: true
    },
    initialValues: {
      type: Object,
      required: true
    }
   });
   
   const fields = [
    { 
      id: 'quantity',
      label: 'Quantité',
      type: 'number',
      placeholder: 'Entrez la quantité'
    }
   ];
   
   // FormUpdateQuantityProductOrder.vue
const validationSchema = z.object({
  quantity: z.number().min(1, 'La quantité doit être supérieure à 0')
});
   </script>