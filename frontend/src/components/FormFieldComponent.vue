<template>
  <div class="form-field mb-4">
    <label :for="id" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-400">
      {{ label }}
    </label>

    <template v-if="type === 'select'">
      <select
        :id="id"
        v-model="inputValue"
        @change="updateValue"
        @blur="validateForm"
        :class="[
          'block w-full p-2.5 rounded-lg focus:ring-primary-600 focus:border-primary-600',
          {
            'bg-gray-50 border border-gray-300 text-gray-900': !error,
            'bg-red-50 border border-red-500 text-red-900': error
          },
          cssClass
        ]"
      >
        <option value="" disabled selected>{{ placeholder }}</option>
        <option v-for="option in options" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
    </template>

    <template v-else>
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
    </template>

    <small v-if="error" class="text-red-500 mt-1 text-xs italic">{{ error }}</small>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
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
  error: String,
  options: { 
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'onBlurInput'])

const inputValue = ref(props.modelValue)

watch(inputValue, (newValue) => {
  emit('update:modelValue', String(newValue))
})

const updateValue = () => emit('update:modelValue', inputValue.value)
const validateForm = (id) => emit('onBlurInput', id)
</script>
