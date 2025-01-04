<template>
  <button
    :class="['px-4 py-2 rounded-full font-semibold', bgColor, textColor, hoverTextColor, hoverBgColor]"
    @click="navigate"
  >
    <slot />
  </button>
</template>

  <script setup>
  import { useRouter } from 'vue-router';

  const props = defineProps({
    bgColor: {
      type: String,
      default: 'bg-primary',
    },
    textColor: {
      type: String,
      default: 'text-white',
    },
    hoverTextColor: {
      type: String,
      default: '',
    },
    hoverBgColor: {
      type: String,
      default: '',
    },
    to: {
      type: String,
      default: null,
    },
  });

  const router = useRouter();

  const navigate = () => {
    if (props.to) {
      router.push(props.to);
    }
  };
</script>