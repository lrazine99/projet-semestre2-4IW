import { ref } from "vue";
import axios from "axios";

export function useDatatable(apiEndpoint) {
  const data = ref([]);
  const isLoading = ref(false);
  const error = ref(null);

  const flattenProductData = (products) => {
    return products.flatMap(product => 
      product.variants.map(variant => ({
        _id: product._id,
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
      }))
    );
  };

  const fetchData = async (params = {}) => {
    isLoading.value = true;
    try {
      const response = await axios.get(apiEndpoint, { params: { ...params, limit: 1000 } });
      data.value = response.data.users || response.data.products || [];
    } catch (err) {
      error.value = err.message;
    } finally {
      isLoading.value = false;
    }
  };
  

  const deleteRow = async (id) => {
    console.log(id)
    try {
      await axios.delete(`${apiEndpoint}/${id}`); 
      data.value = data.value.filter((row) => row._id.toString() !== id.toString()); 
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

  const addRow = async (newData) => {
    try {
      const response = await axios.post(apiEndpoint, newData);
      data.value.push(response.data);
    } catch (err) {
      error.value = err.message;
    }
  };
  

  return {
    data,
    isLoading,
    error,
    fetchData,
    deleteRow,
    updateRow,
    addRow,
  };
}