<template>
  <div class="flex flex-none flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
    <h1>
      <span class="cursor-pointer my-2 text-2xl font-manrope font-black leading-snug text-transparent bg-clip-text mr-1"
        :class="{
          'bg-gradient-to-r from-indigo-600 via-pink-600 to-purple-600':
            formChoice === 'Register',
          'bg-gradient-to-r from-gray-300 to-gray-900': formChoice === 'Login'
        }" @click="handleFormChoice">Inscription</span>
      <span>|</span>
      <span class="cursor-pointer ml-1 my-2 text-2xl font-manrope font-black leading-snug text-transparent bg-clip-text"
        :class="{
          'bg-gradient-to-r from-indigo-600 via-pink-600 to-purple-600': formChoice === 'Login',
          'bg-gradient-to-r from-gray-300 to-gray-900': formChoice === 'Register'
        }" @click="handleFormChoice">Connexion</span>
    </h1>
    <div class="w-[20rem]  rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0">
      <FormLoginComponent v-if="formChoice === 'Login'" />
      <FormRegisterComponent v-if="formChoice === 'Register'" />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeMount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import FormLoginComponent from '../components/forms/FormLoginComponent.vue'
import FormRegisterComponent from '@/components/forms/FormRegisterComponent.vue'
import { useLoginStore } from '@/stores/loginStore';

const { isAuthenticated } = useLoginStore();

const route = useRoute()
const router = useRouter()
const formChoice = ref('')

onBeforeMount(() => {
  
  if (isAuthenticated) {    
    router.push('/product')
  }
})

const updateHash = () => {
  formChoice.value = window.location.hash === '#connexion' ? 'Login' : 'Register'
}

watch(route, updateHash)


onMounted(updateHash)


const handleFormChoice = () => {
  if (formChoice.value === 'Register') {
    formChoice.value = 'Login'
    router.replace({ hash: '/#connexion' })
  } else {
    formChoice.value = 'Register'
    router.replace({ hash: '/#inscription' })
  }
}
</script>
