<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="my-[10rem]">
    <TitleComponent titleText="Demander la réinitialisation du mot de passe" />
    <FormRequestResetPasswordComponent />
  </div>
</template>
<script setup>
import TitleComponent from '@/components/TitleComponent.vue';
import FormRequestResetPasswordComponent from '../components/forms/FormRequestResetPasswordComponent.vue';
</script>
