<template>
  <div class="form-field mb-4">
    <label :for="id" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-400">
      {{ label }}
    </label>
    <input
      :id="id"
      :type="type"
      :placeholder="placeholder"
      v-model="inputValue"
      @input="updateValue"
      @blur="validateForm"
      @onchange="validateForm"
      :class="[
        'block w-full p-2.5 rounded-lg focus:ring-primary-600 focus:border-primary-600',
        {
          'bg-gray-50 border border-gray-300 text-gray-900': !error,
          'bg-red-50 border border-red-500 text-red-900': error
        },
        cssClass
      ]"
    />
    <small v-if="error" class="text-red-500 mt-1 text-xs italic">{{ error }}</small>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: String,
  label: String,
  id: String,
  type: {
    type: String,
    default: 'text'
  },
  cssClass: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Entrez valeur...'
  },
  error: String // Error message prop from the form component
})

const emit = defineEmits(['update:modelValue, onBlurInput'])
const inputValue = ref(props.modelValue || '')

watch(inputValue, (newValue) => {
  emit('update:modelValue', newValue)
})

const updateValue = () => emit('update:modelValue', inputValue.value)
const validateForm = (id) => emit('onBlurInput', id)
</script>
