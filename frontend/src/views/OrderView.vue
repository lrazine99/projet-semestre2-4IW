<template>
  <LoaderComponent :isVisible="!stripeLoaded" />
  <TitleComponent titleText="Commande" class="mt-4" />
  <div v-if="stripeLoaded" class="p-6 w-full flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-6">
    <!-- Forms Section -->
    <div class="w-full md:w-2/3 space-y-6">
      <!-- Billing and Shipping Address -->
      <div class="bg-gray-50 p-6 rounded-md shadow-md">
        <h2 class="text-lg font-semibold mb-4">Adresse</h2>
        <div class="flex items-center mb-4">
          <input type="checkbox" id="addressAccount" v-model="addressAccount" class="mr-2" />
          <label for="addressAccount" class="text-sm text-gray-700">
            Enregistrer l'adresse pour les prochaines commandes
          </label>

        </div>
        <div class="flex items-center mb-4">
          <input type="checkbox" id="sameAsBilling" v-model="sameAsBilling" class="mr-2" />
          <label for="sameAsBilling" class="text-sm text-gray-700">
            Adresse de livraison identique à l'adresse de facturation
          </label>
        </div>
        <div class="flex flex-col md:flex-row md:space-x-6">
          <!-- Billing Address -->
          <div class="w-full space-y-4">
            <form>
              <div class="flex md:space-x-4 md:flex-row flex-col">
                <div :class="sameAsBilling ? 'w-full' : 'md:w-1/2'">
                  <p class="text-md font-medium mb-2">Adresse de Facturation</p>

                  <FormFieldComponent v-for="field in fields.slice(0, 6)" :key="field.id" v-bind="field"
                    v-model="formData[field.id]" :error="validationErrors[field.id]" @input="clearFieldError(field.id)"
                    @onBlurInput="validateSingleField" />



                </div>
                <div v-if="!sameAsBilling" class="md:w-1/2">
                  <p class="text-md font-medium mb-2">Adresse de Livraison</p>

                  <FormFieldComponent v-for="field in fields.slice(6) " :key="field.id" v-bind="field"
                    v-model="formData[field.id]" :error="validationErrors[field.id]" @input="clearFieldError(field.id)"
                    @onBlurInput="validateSingleField" />
                </div>
              </div>

            </form>
          </div>

        </div>
      </div>
    </div>

    <!-- Order Summary Section -->
    <div class="w-full md:w-4/6 space-y-6 ">
      <!-- Summary Card -->
      <div class="bg-white p-6 rounded-md shadow-md">
        <h2 class="text-lg font-semibold mb-4 text-center">Résumé de la commande</h2>
        <div class="space-y-4">
          <div class="flex justify-between">
            <p class="text-gray-700">Produit</p>
            <p class="text-gray-700">Total</p>
          </div>
          <div v-for="(item, index) in cartItems" :key="index" class="flex justify-between">
            <p class="text-sm text-gray-500">
              {{ item.title }} - {{ item.platform }} x {{ item.quantity }}
            </p>
            <p class="text-sm text-gray-700">
              {{ (item.price * item.quantity).toFixed(2) }}€
            </p>
          </div>
          <div class="flex justify-between border-t pt-2">
            <p class="text-gray-700">Expédition</p>
            <p class="text-gray-700">Livraison gratuite</p>
          </div>
          <div class="flex justify-between font-semibold border-t pt-2">
            <p class="text-gray-900">Total TTC</p>
            <p class="text-gray-900">{{ totalPrice }}€</p>
          </div>
        </div>
      </div>

      <!-- Payment Section -->
      <div class="bg-gray-50 p-6 rounded-md shadow-md">
        <h2 class="text-lg font-semibold mb-4 text-center">Paiement</h2>
        <StripeElements v-if="stripeLoaded" v-slot="{ elements }" ref="elms" :stripe-key="publishableKey"
          :elements-options="elementsOptions">
          <StripeElement ref="cardElement" :elements="elements" :options="cardOptions" />
        </StripeElements>
        <button @click="handlePayment" :disabled="isSubmitting"
          class="mt-4 px-5 py-2.5 w-full bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700">
          Payer {{ totalPrice }}€
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onBeforeMount } from 'vue';
import { StripeElements, StripeElement } from 'vue-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useCartStore } from '@/stores/cartStore';
import { VITE_API_ENDPOINT, VITE_STRIPE_PUBLIC_KEY } from '@/utils/const';
import { z } from 'zod';
import LoaderComponent from '@/components/LoaderComponent.vue';
import axios from 'axios';
import { useLoginStore } from '@/stores/loginStore';
import router from '@/router';
import FormFieldComponent from '@/components/FormFieldComponent.vue';
import TitleComponent from '@/components/TitleComponent.vue';
import { useInvoicePDF } from "@/composables/useInvoicePDF";
import { formatDate } from '@/utils/utils';
import { toast } from 'vue3-toastify';

const publishableKey = VITE_STRIPE_PUBLIC_KEY;
const stripeLoaded = ref(false);
const cardElement = ref(null);
const elms = ref(null);
const validationErrors = ref({})
const addressAccount = ref(true);
const isSubmitting = ref(false);
const userLoaded = ref(null);
const cartStore = useCartStore();
const { isAuthenticated, token } = useLoginStore();
const cartItems = computed(() => cartStore.cartItems);
const totalPrice = computed(() => {
  return `${(cartStore.totalPrice * 1.2).toLocaleString('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  })}`;
});
const { generatePDF } = useInvoicePDF();
const elementsOptions = ref({});
const cardOptions = ref({
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
    },
  },
});

const totalPriceWithoutTax = computed(() => {
  return `${cartStore.totalPrice.toLocaleString('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  })}`;
});



// Checkbox state
const sameAsBilling = ref(true);

const fields = [
  { id: 'billingAddressNumber', label: 'Numéro d\'adresse', type: 'number', placeholder: 'Entrez le numéro d\'adresse', required: true },
  { id: 'billingStreet', label: 'Rue', type: 'text', placeholder: 'Entrez le nom de la rue', required: true },
  { id: 'billingComplement', label: 'Complément', type: 'text', placeholder: 'Complément d\'adresse (facultatif)', required: false },
  { id: 'billingZipCode', label: 'Code postal', type: 'number', placeholder: 'Entrez votre code postal', required: true },
  { id: 'billingCity', label: 'Ville', type: 'text', placeholder: 'Entrez le nom de votre ville', required: true },
  { id: 'billingCountry', label: 'Pays', type: 'text', placeholder: 'Entrez votre pays', required: true },

  { id: 'shippingAddressNumber', label: 'Numéro d\'adresse', type: 'number', placeholder: 'Entrez le numéro d\'adresse', required: true },
  { id: 'shippingStreet', label: 'Rue', type: 'text', placeholder: 'Entrez le nom de la rue', required: true },
  { id: 'shippingComplement', label: 'Complément', type: 'text', placeholder: 'Complément d\'adresse (facultatif)', required: false },
  { id: 'shippingZipCode', label: 'Code postal', type: 'number', placeholder: 'Entrez votre code postal', required: true },
  { id: 'shippingCity', label: 'Ville', type: 'text', placeholder: 'Entrez le nom de votre ville', required: true },
  { id: 'shippingCountry', label: 'Pays', type: 'text', placeholder: 'Entrez votre pays', required: true },
];


const validationSchema = z.object({
  billingAddressNumber: z.number().min(1, 'Numéro d\'adresse requis'),
  billingStreet: z.string().min(1, 'Rue requise'),
  billingComplement: z.string().optional(),
  billingZipCode: z.number()
    .int("Le code postal doit être un entier")
    .min(10000, "Le code postal doit comporter au moins 5 chiffres")
    .max(99999, "Le code postal ne peut pas dépasser 5 chiffres")
    .refine((val) => !/^97|98/.test(val.toString()), "Les codes postaux d'outre-mer ne sont pas autorisés"),
  billingCity: z.string().min(1, 'Ville requise'),
  billingCountry: z.string().min(1, 'Pays requis').regex(/^france$/i, 'Livraison uniquement en France'),

  shippingAddressNumber: z.number().min(1, 'Numéro d\'adresse requis'),
  shippingStreet: z.string().min(1, 'Rue requise'),
  shippingComplement: z.string().optional(),
  shippingZipCode: z.number('')
    .int("Le code postal doit être un entier")
    .min(1000, "Le code postal doit comporter au moins 4 chiffres")
    .max(99999, "Le code postal ne peut pas dépasser 5 chiffres")
    .refine((val) => !/^97|98/.test(val.toString()), "Les codes postaux d'outre-mer ne sont pas autorisés"),
  shippingCity: z.string().min(1, 'Ville requise'),
  shippingCountry: z.string().min(1, 'Pays requis').regex(/^france$/i, 'Livraison uniquement en France'),
});

const formData = ref(Object.fromEntries(fields.map((field) => [field.id, ''])))


onBeforeMount(async () => {

  if (isAuthenticated) {
    try {

      const { data } = await axios.get(`${VITE_API_ENDPOINT}/user/get-user`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      userLoaded.value = data;

      if (data.address) {

        data.address.zipCode = parseInt(data.address.zipCode);

        Object.keys(formData.value).forEach((key, index) => {
          if (index < 6) {
            console.log(Object.keys(data.address)[index]);
            formData.value[key] = data.address[Object.keys(data.address)[index]];
          } else {
            console.log(Object.keys(data.address)[index - 6]);

            formData.value[key] = data.address[Object.keys(data.address)[index - 6]];
          }
        });
      }

      await loadStripe(publishableKey);

      stripeLoaded.value = true;

    } catch (error) {
      console.error("Erreur lors de la récupération du panier :", error);
    }
  } else if (cartItems.value.length === 0) {
    router.push("/produits");
  } else {
    router.push("/inscription-connexion/#connexion");
  }
});

const mapToFormData = () => {
  if (sameAsBilling.value) {
    formData.value.shippingAddressNumber = formData.value.billingAddressNumber;
    formData.value.shippingStreet = formData.value.billingStreet;
    formData.value.shippingComplement = formData.value.billingComplement;
    formData.value.shippingZipCode = formData.value.billingZipCode;
    formData.value.shippingCity = formData.value.billingCity;
    formData.value.shippingCountry = formData.value.billingCountry;
  } else {
    formData.value.shippingAddressNumber = "";
    formData.value.shippingStreet = "";
    formData.value.shippingComplement = "";
    formData.value.shippingZipCode = "";
    formData.value.shippingCity = "";
    formData.value.shippingCountry = "";
  }

}

const validateForm = () => {
  validationErrors.value = {}

  const result = validationSchema.safeParse(formData.value)

  if (!result.success) {
    result.error.issues.forEach((issue) => {
      validationErrors.value[issue.path[0]] = issue.message
    })
    return false
  }
  return true
}

const validateSingleField = ({ target: { id: fieldId } }) => {
  const field = fields.find((f) => f.id === fieldId)

  if (!field || !formData.value[fieldId].length) return

  const singleFieldData = { [fieldId]: formData.value[fieldId] }
  const singleFieldSchema = validationSchema.pick({ [fieldId]: true })
  const result = singleFieldSchema.safeParse(singleFieldData)

  if (!result.success) {
    validationErrors.value[fieldId] = result.error.issues[0].message
  } else {
    delete validationErrors.value[fieldId]
  }
}

const clearFieldError = (fieldId) => {
  delete validationErrors.value[fieldId]
}

const handlePayment = async () => {
  try {
    mapToFormData();

    if (!validateForm() || isSubmitting.value) return

    isSubmitting.value = true

    const result = await elms.value.instance.createToken(cardElement.value.stripeElement);

    if (result.error) {
      console.error('Stripe error:', result.error.message);
      alert('Erreur lors de la génération du token Stripe.');

      toast.error('Erreur lors de la génération du token Stripe.', {
        autoClose: 1000,
      });
      return;
    }

    const paymentData = {
      token: result.token.id,
      amount: cartStore.totalPrice * 1.2,
      currency: 'eur',
    };


    const billingAddress = {
      number: formData.value.billingAddressNumber,
      street: formData.value.billingStreet,
      complement: formData.value.billingComplement,
      zipCode: formData.value.billingZipCode,
      city: formData.value.billingCity,
      country: formData.value.billingCountry,
    };

    const shippingAddress = {
      number: formData.value.shippingAddressNumber,
      street: formData.value.shippingStreet,
      complement: formData.value.shippingComplement,
      zipCode: formData.value.shippingZipCode,
      city: formData.value.shippingCity,
      country: formData.value.shippingCountry,
    };

    formData.value = { billingAddress, shippingAddress, ...userLoaded.value, ...paymentData, cartItems: cartItems.value };

    addressAccount.value ? formData.value.addressAccount = true : formData.value.addressAccount = false;

    const { data } = await axios.post(`${VITE_API_ENDPOINT}/order/create`, formData.value,
      { headers: { Authorization: `Bearer ${token}` } }

    );

    toast.success('Paiement réussi!', {
      autoClose: 1000,
    });

    const fileName = data.invoiceNumber;
    const nowDate = new Date();
    const formattedDate = formatDate(nowDate);


    const invoiceData = {
      companyLogo: "path/to/logo.png",
      creationDate: formattedDate,
      invoiceId: fileName,
      company: {
        name: "GameMarket",
        siret: "123456789",
        address: "123 rue de la rue",
        city: "Paris",
        zipCode: "75000",
      },
      client: {
        firstName: userLoaded.value.firstName,
        lastName: userLoaded.value.lastName,
        address: `${billingAddress.number} ${billingAddress.street}`,
        city: billingAddress.city,
        zipCode: billingAddress.zipCode,
      },
      items: cartItems.value.map((item) => ({
        name: item.title,
        price: item.price,
        quantity: item.quantity,
        taxRate: 20,
        totalWithoutTax: (item.price * item.quantity).toFixed(2),
        totalWithTax: ((item.price * item.quantity) * 1.2).toFixed(2),
      })),
      totalWithoutTax: totalPriceWithoutTax.value,
      totalTax: (cartStore.totalPrice * 1.2 - cartStore.totalPrice).toFixed(2),
      totalWithTax: totalPrice.value,
      notes: "Merci pour votre achat!",
    };

    const pdfBlob = await generatePDF(invoiceData);

    const formDataInvoice = new FormData();

    formDataInvoice.append("pdf", pdfBlob, "invoice.pdf");
    formDataInvoice.append("email", userLoaded.value.email);
    formDataInvoice.append("fileName", fileName);

    await axios.post(`${VITE_API_ENDPOINT}/order/send/invoice`, formDataInvoice, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    cartStore.removeAll();

    toast.success('Paiement réussi!', {
      autoClose: 1000,
      onClose: () => {
        router.push('/')
      }
    });
    // Proceed with payment
  } catch (error) {
    toast.error(`Une erreur est survenue: ${error.messge}`, {
      autoClose: 1000,
      onClose: () => {
        router.push('/')
      }
    });
  }

  isSubmitting.value = false;
};






</script>
