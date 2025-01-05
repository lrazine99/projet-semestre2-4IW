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

// Props definition
const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  label: {
    type: String,
    required: true,
  },
  id: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    default: 'text',
  },
  cssClass: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: 'Entrez valeur...',
  },
  error: {
    type: String,
    default: '',
  },
})

// Events emitted
const emit = defineEmits(['update:modelValue', 'onBlurInput'])

// Local input value bound to the prop
const inputValue = ref(props.modelValue)

// Watch for changes in the `modelValue` prop to update `inputValue`
watch(
  () => props.modelValue,
  (newValue) => {
    inputValue.value = newValue
  }
)

// Update the parent component when `inputValue` changes
watch(inputValue, (newValue) => {
  emit('update:modelValue', newValue)
})

// Emit the updated value on input
const updateValue = () => {
  emit('update:modelValue', inputValue.value)
}

// Emit the blur event with the field's id
const validateForm = (id) => {
  emit('onBlurInput', id)
}
</script>
