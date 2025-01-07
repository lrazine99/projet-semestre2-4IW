<template>
    <div v-if="fields.length"   class="transform transition-all  p-6 mt-3 space-y-4 md:space-y-6 sm:p-8 ">
        <FormComponent  :fields="fields" :validationSchema="validationSchema" :handleSubmit="handleSubmit"
            submitButtonText="Modifer Votre Adresse" />

    </div>
</template>

<script setup>
import { z } from 'zod';
import FormComponent from '../FormComponent.vue';
import axios from 'axios';
import { VITE_API_ENDPOINT } from '@/utils/const';
import { toast } from 'vue3-toastify';
import { onBeforeMount } from 'vue';
import { useLoginStore } from '@/stores/loginStore';
import { ref } from 'vue';

const initialFields = [
    { id: 'number', label: 'Numéro d\'adresse', type: 'number', placeholder: 'Entrez le numéro d\'adresse', required: true },
    { id: 'street', label: 'Rue', type: 'text', placeholder: 'Entrez le nom de la rue', required: true },
    { id: 'complement', label: 'Complément', type: 'text', placeholder: 'Complément d\'adresse (facultatif)', required: false },
    { id: 'zipCode', label: 'Code postal', type: 'number', placeholder: 'Entrez votre code postal', required: true },
    { id: 'city', label: 'Ville', type: 'text', placeholder: 'Entrez le nom de votre ville', required: true },
    { id: 'country', label: 'Pays', type: 'text', placeholder: 'Entrez votre pays', required: true },
];

const fields = ref([]);

const validationSchema = z.object({
    number: z.number().min(1, 'Numéro d\'adresse requis'),
    street: z.string().min(1, 'Rue requise'),
    complement: z.string().optional(),
    zipCode: z.number()
        .int("Le code postal doit être un entier")
        .min(10000, "Le code postal doit comporter au moins 5 chiffres")
        .max(99999, "Le code postal ne peut pas dépasser 5 chiffres")
        .refine((val) => !/^97|98/.test(val.toString()), "Les codes postaux d'outre-mer ne sont pas autorisés"),
    city: z.string().min(1, 'Ville requise'),
    country: z.string().min(1, 'Pays requis').regex(/^france$/i, 'Livraison uniquement en France'),

});

const { isAuthenticated, token } = useLoginStore();

onBeforeMount(async () => {
    if (isAuthenticated) {
        try {
            const { data } = await axios.get(`${VITE_API_ENDPOINT}/user/get-user`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const address = data.address;
            
            if (address) {
                
                address.zipCode = parseInt(address.zipCode);

                initialFields.forEach((field) => {
                    field.val = address[field.id];
                });
                
            }
            
            fields.value.push(...initialFields)
        } catch (error) {
            console.log(error);

            toast.error('Erreur lors de la récupération de l\'adresse', {
                autoClose: 1000,
            }); // ToastOptions
        }
    }
});
const handleSubmit = async (formData, signal) => {
    if (isAuthenticated) {

        try {
            await axios.post(`${VITE_API_ENDPOINT}/user/update-address`, formData, {
                signal,
                headers: { Authorization: `Bearer ${token}` },
            });

            toast.success('Adresse modifiée avec succès', {
                autoClose: 1000,
            }); // ToastOptions
        } catch (error) {

            toast(error.response.data.message, {
                autoClose: 1000,
            }); // ToastOptions

            throw error;
        }
    }
}
</script>