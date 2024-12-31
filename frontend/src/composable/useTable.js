import { ref } from "vue";
import axios from "axios";
export function useDatatable(apiEndpoint) {
  const data = ref([]);
  const isLoading = ref(false);
  const error = ref(null);
  const allProducts = ref([]);

  const productVariantData = (products) => {
    return products.flatMap(product =>
      product.variants.map(variant => ({
        _id: product._id,
        variantId: variant._id,
        name: product.name,
        description: product.description,
        genres: product.genres.join(', '),
        minAge: product.minAge,
        editor: product.editor,
        variantName: variant.name,
        variantEdition: variant.edition,
        variantPrice: variant.price,
        variantStock: variant.stock,
        platform: variant.platform.name,
        images: variant.images,
        releaseDate: variant.releaseDate,
        barcode: variant.barcode,
      }))
    );
  };

  const fetchData = async (params = {}) => {
    isLoading.value = true;
    try {
      const response = await axios.get(apiEndpoint, { params: { ...params, limit: 1000 } });
      if (response.data.users) {
        data.value = response.data.users || [];
      } else if (response.data.products) {
        data.value = response.data.products || [];
      }
    } catch (err) {
      error.value = err.message;
    } finally {
      isLoading.value = false;
    }
  };

  const fetchVariantData = async (params = {}) => {
    isLoading.value = true;
    try {
      const response = await axios.get(apiEndpoint, { params: { ...params, limit: 1000 } });
      const products = response.data.products || [];
      allProducts.value = response.data.products
      data.value = productVariantData(products);
    } catch (err) {
      error.value = err.message;
    } finally {
      isLoading.value = false;
    }
  };

const deleteRow = async (id) => {
  try {
    await axios.delete(`${apiEndpoint}/${id}`);
    data.value = data.value.filter((row) => row._id.toString() !== id.toString());
  } catch (err) {
    error.value = err.message;
  }
};

const deleteRowVariant = async (productId, variantId) => {
  try {
    await axios.delete(`${apiEndpoint}/${productId}/variant/${variantId}`);
    data.value = data.value.map((product) => {
      if (product._id.toString() === productId.toString()) {
        product.variants = product.variants.filter(
          (variant) => variant._id.toString() !== variantId.toString()
        );
      }
      return product;
    });
  } catch (err) {
    error.value = err.message;
  }
};

  const updateRow = async (id, updatedData) => {
    try {
      const response = await axios.put(`${apiEndpoint}/${id}`, updatedData);
      const index = data.value.findIndex((row) => row.id === id);
      if (index !== -1) {
        data.value[index] = response.data;
      }
    } catch (err) {
      error.value = err.message;
    }
  };

  const updateRowVariant = async (productId, variantId, updatedData) => {
    try {
      const response = await axios.put(`${apiEndpoint}/${productId}/variant/${variantId}`, updatedData);
  
      if (!Array.isArray(data.value)) {
        console.error("data.value n'est pas un tableau", data.value);
        return;
      }
  
      const product = data.value.find((product) => product.variantId === variantId);
      if (product) {
        if (product.variantId === variantId) {
          product.variantId = response.data.variantId;
        } else {
          console.error("La variante n'a pas été trouvée avec l'ID :", variantId);
        }
      } else {
        console.error("Le produit n'a pas été trouvé avec l'ID :", productId);
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la variante :", error);
      throw error;
    }
  };

  const addRow = async (newData) => {
    try {
      const response = await axios.post(apiEndpoint, newData);
      data.value.push(response.data);
    } catch (err) {
      error.value = err.message;
    }
  };
  
  const addRowVariant = async (productId, newVariantData) => {
    try {
      const response = await axios.post(`${apiEndpoint}/${productId}/variant`, newVariantData);
      data.value = data.value.map((product) => {
        if (product._id.toString() === productId.toString()) {
          product.variants.push(response.data.variant); 
        }
        return product;
      });
    } catch (err) {
      error.value = err.message;
    }
  };

  return {
    data,
    isLoading,
    error,
    fetchData,
    fetchVariantData,
    deleteRow,
    deleteRowVariant,
    updateRow,
    updateRowVariant,
    addRow,
    addRowVariant,
    allProducts
  };
}