<template>
    <div class="p-6 space-y-4 md:space-y-6 bg-white sm:p-8 mx-auto w-[100%] mt-6">
        <FormComponent
            :fields="updateOrderFields"
            :validationSchema="updateOrderSchema"
            :handleSubmit="handleSubmit"
            :formData="order" 
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
const order = ref({ ...props.initialValues });


const updateOrderFields = [
    { id: 'invoiceNumber', label: 'Numéro de la commande', type: 'text', placeholder: 'Entrez le numéro de la commande' },
    { id: 'buyer', label: 'Nom de l\'acheteur', type: 'text', placeholder: 'Entrez le nom de l\'acheteur' },
    { id: 'total', label: 'Prix total', type: 'number', placeholder: 'Entrez le prix total' },
    { id: 'orderAt', label: 'Date de la commande', type: 'datetime-local', placeholder: 'Sélectionnez la date de la commande' },
    { 
        id: 'orderStatus', 
        label: 'Statut de la commande', 
        type: 'select', 
        options: [
            { value: 'PENDING', label: 'En attente' },
            { value: 'CONFIRMED', label: 'Confirmée' },
            { value: 'SHIPPED', label: 'Expédiée' },
            { value: 'DELIVERED', label: 'Livrée' },
            { value: 'CANCELLED', label: 'Annulée' }
        ], 
        placeholder: 'Sélectionnez le statut de la commande' 
    },
    { 
        id: 'paymentStatus', 
        label: 'Statut du paiement', 
        type: 'select', 
        options: [
            { value: 'PAID', label: 'Payé' },
            { value: 'PENDING', label: 'En attente' }
        ], 
        placeholder: 'Sélectionnez le statut du paiement' 
    },
];

const updateOrderSchema = z.object({
    invoiceNumber: z.string().min(1, 'Numéro de la commande requis'),
    buyer: z.string().min(1, 'Nom de l\'acheteur requis'),
    total: z.number().min(0, 'Prix total invalide'),
    orderAt: z.string().min(1, 'Date de la commande requise'),
    orderStatus: z.string().min(1, 'Statut de la commande requis'),
    paymentStatus: z.string().min(1, 'Statut du paiement requis'),
});

</script>
