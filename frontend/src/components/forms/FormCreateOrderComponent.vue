<template>
    <div class="p-6 space-y-4 md:space-y-6 bg-white sm:p-8 mx-auto w-full mt-6">
      <!-- Select user (une seule fois) -->
      <div class="mb-4">
        <label for="userEmail" class="block text-sm font-medium text-gray-700 mb-1">Utilisateur</label>
        <select 
          id="userEmail"
          v-model="selectedUserId" 
          class="w-full p-2 border rounded-md"
          :class="{ 'border-red-500': userError }"
        >
          <option value="">Sélectionnez un utilisateur</option>
          <option 
            v-for="user in users" 
            :key="user.value" 
            :value="user.value"
          >
            {{ user.label }}
          </option>
        </select>
        <p v-if="userError" class="mt-1 text-sm text-red-600">
          {{ userError }}
        </p>
      </div>
  
      <!-- Formulaires des produits -->
      <div v-for="(productForm, index) in productForms" :key="index" class="border p-4 rounded-lg relative mb-4">
        <button 
          @click="removeProductForm(index)"
          class="absolute top-2 right-2 text-white px-4 py-2 bg-red-500 rounded hover:bg-red-600"
          type="button"
        >
          Supprimer
        </button>
  
        <div class="grid grid-cols-2 gap-4 mt-6">
          <div>
            <label :for="`productVariant-${index}`" class="block text-sm font-medium text-gray-700 mb-1">
              Produit
            </label>
            <select
              :id="`productVariant-${index}`"
              v-model="productForm.productVariant"
              class="w-full p-2 border rounded-md"
              :class="{ 'border-red-500': productErrors[index]?.productVariant }"
            >
              <option value="">Sélectionnez un produit</option>
              <option 
                v-for="variant in productVariants" 
                :key="variant.value" 
                :value="variant.value"
              >
                {{ variant.label }}
              </option>
            </select>
            <p v-if="productErrors[index]?.productVariant" class="mt-1 text-sm text-red-600">
              {{ productErrors[index].productVariant }}
            </p>
          </div>
  
          <div>
            <label :for="`quantity-${index}`" class="block text-sm font-medium text-gray-700 mb-1">
              Quantité
            </label>
            <input
              :id="`quantity-${index}`"
              v-model.number="productForm.quantity"
              type="number"
              min="1"
              class="w-full p-2 border rounded-md"
              :class="{ 'border-red-500': productErrors[index]?.quantity }"
              placeholder="Entrez la quantité"
            >
            <p v-if="productErrors[index]?.quantity" class="mt-1 text-sm text-red-600">
              {{ productErrors[index].quantity }}
            </p>
          </div>
        </div>
      </div>
  
      <!-- Bouton pour ajouter un produit -->
      <button
        @click="addProductForm"
        class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 mb-4"
      >
        Ajouter un autre produit
      </button>
  
      <!-- Bouton de validation finale -->
      <button
        @click="handleFormSubmit"
        class="w-full mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
      >
        Valider la commande
      </button>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, reactive } from 'vue';
  import { z } from 'zod';
  import axios from 'axios';
  import { VITE_API_ENDPOINT } from '@/utils/const';
  
  // Schémas de validation
  const userSchema = z.object({
    userEmail: z.string().min(1, 'L\'utilisateur est requis')
  });
  
  const productSchema = z.object({
    productVariant: z.string().min(1, 'Le produit est requis'),
    quantity: z.number()
      .min(1, 'La quantité doit être supérieure à 0')
      .int('La quantité doit être un nombre entier')
  });
  
  const orderSchema = z.object({
    buyer: z.string().min(1, 'L\'utilisateur est requis'),
    products: z.array(productSchema).min(1, 'Au moins un produit est requis')
  });
  
  // États réactifs
  const selectedUserId = ref('');
  const users = ref([]);
  const productVariants = ref([]);
  const productForms = ref([]);
  const userError = ref('');
  const productErrors = ref([]);
  const generalError = ref('');
  
  // Récupération des utilisateurs
  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${VITE_API_ENDPOINT}/user`);
      users.value = response.data.users.map(user => ({
        value: user._id,
        label: user.email,
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
    }
  };
  
  // Récupération des variantes de produits
  const fetchVariants = async () => {
    try {
      const response = await axios.get(`${VITE_API_ENDPOINT}/product`);
      const platforms = response.data.platforms;
  
      const platformMap = Object.fromEntries(
        platforms.map(platform => [platform._id, platform.name])
      );
  
      productVariants.value = response.data.productsFound.flatMap(product =>
        product.variants.map(variant => ({
          value: variant.sku,
          label: `${product.name} - ${variant.name} (${platformMap[variant.platform] || 'N/A'})`
        }))
      );
    } catch (error) {
      console.error('Erreur lors de la récupération des variantes:', error);
    }
  };
  
  // Ajout d'un formulaire de produit
  const addProductForm = () => {
    productForms.value.push({
      productVariant: '',
      quantity: 1
    });
  };
  
  // Suppression d'un formulaire de produit
  const removeProductForm = (index) => {
    productForms.value.splice(index, 1);
  };
  
  // Validation du formulaire
  const validateForm = () => {
    // Réinitialisation des erreurs
    userError.value = '';
    productErrors.value = [];
    generalError.value = '';
  
    try {
      // Validation de l'utilisateur
      userSchema.parse({ userEmail: selectedUserId.value });
  
      // Validation des produits
      productForms.value.forEach((form, index) => {
        productSchema.parse(form);
      });
  
      // Validation globale de la commande
      orderSchema.parse({
        buyer: selectedUserId.value,
        products: productForms.value
      });
  
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach((err) => {
          const path = err.path[0];
          
          if (path === 'userEmail') {
            userError.value = err.message;
          } else if (path === 'products') {
            const index = err.path[1];
            const field = err.path[2];
            
            if (!productErrors.value[index]) {
              productErrors.value[index] = {};
            }
            productErrors.value[index][field] = err.message;
          } else {
            generalError.value = err.message;
          }
        });
      }
      return false;
    }
  };
  
  // Soumission du formulaire
  const handleFormSubmit = async () => {
    // Validation du formulaire
    if (!validateForm()) {
      return;
    }
  
    try {
      // Récupération des détails des produits
      const products = await Promise.all(productForms.value.map(async (form) => {
        const productResponse = await axios.get(`${VITE_API_ENDPOINT}/product/variant/${form.productVariant}`);
        const variant = productResponse.data.product.variant;
  
        return {
          productSku: form.productVariant,
          quantity: form.quantity,
          price: variant.price,
          productImage: variant.images[0],
          productName: variant.name
        };
      }));
  
      // Calcul du total
      const total = products.reduce((sum, product) => 
        sum + (product.price * product.quantity), 0
      );
  
      // Préparation des données de commande
      const orderData = {
        buyer: selectedUserId.value,
        products,
        total,
        orderStatus: "PENDING",
        paymentStatus: "PAID"
      };
  
      // Envoi de la commande
      const response = await axios.post(`${VITE_API_ENDPOINT}/order`, orderData);
      
      // Réinitialisation du formulaire
      selectedUserId.value = '';
      productForms.value = [];
      addProductForm();
      // Confirmation
      alert('Commande créée avec succès');
    } catch (error) {
      console.error('Erreur lors de la création de la commande:', error);
      generalError.value = 'Erreur lors de la création de la commande';
    }
  };
  
  // Initialisation
  onMounted(() => {
    fetchUsers();
    fetchVariants();
    addProductForm();
  });
  </script>