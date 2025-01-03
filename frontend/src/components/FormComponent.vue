<template>
  <form @submit.prevent="handleForm" >
    <FormFieldComponent v-for="field in fields" :key="field.id" v-bind="field" v-model="formData[field.id]"
      :error="validationErrors[field.id]" @input="clearFieldError(field.id)" @onBlurInput="validateSingleField" />


    <div class="flex justify-center">
      <button type="submit" :disabled="isSubmitting"
        class="bg-indigo-500 text-white font-bold py-2 px-4 rounded flex items-center cursor-pointer">
        <svg v-if="isSubmitting" class="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg"
          fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
        </svg>
        {{ submitButtonText }}
      </button>
    </div>
    <div class="flex justify-center mt-2">

      <button v-if="isSubmitting"
        class="bg-indigo-500 text-white font-bold py-2 px-4 rounded flex items-center cursor-pointer" type="button"
        @click="cancelRequest">Annuler</button>
    </div>
  </form>
</template>

<script setup>
import { ref, onUnmounted } from 'vue'
import FormFieldComponent from './FormFieldComponent.vue'
import AbortControllerManager from '../controllers/AbortControllerManager';

const { fields, validationSchema, submitButtonText, handleSubmit } = defineProps({
  fields: {
    type: Array,
    required: true
  },
  validationSchema: {
    type: Object, // Zod schema
    required: true
  },
  submitButtonText: {
    type: String,
    default: 'Submit'
  },
  handleSubmit: {
    type: Function,
    required: true
  },

})

const formData = ref(Object.fromEntries(fields.map((field) => [field.id, ''])))
const validationErrors = ref({})
const serverError = ref(null)
const isSubmitting = ref(false)
const decoratedAbort = new AbortControllerManager();

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

const handleForm = async () => {

  if (!validateForm() || isSubmitting.value) return

  isSubmitting.value = true
  serverError.value = null

  try {
    await handleSubmit(formData.value, decoratedAbort.signal)
  } catch (error) {
    console.log('Request canceled')
  } finally {
    isSubmitting.value = false
  }
}

const cancelRequest = () => {
  decoratedAbort.abort()
}

onUnmounted(() => {
  cancelRequest()
})


</script>
