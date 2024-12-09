<template>
    <a
        :class="['cursor-pointer', textColor, fontWeight, hoverTextColor]"
        @click="navigate"
    >
        <slot />
    </a>
</template>

<script setup>
  import { useRouter } from 'vue-router';
  defineProps({
    textColor: {
      type: String,
      default: 'text-white',
    },
    hoverTextColor: {
      type: String,
      default: 'hover:text-primary', 
    },
    fontWeight: {
      type: String,
      default: 'font-medium', 
    },
    to: {
      type: String,
      default: null,
    },
  });

  const router = useRouter();

  function navigate() {
    if (to) {
      router.push(to);
    }
  }
</script>