<template>
  <button
    :class="['px-4 py-2 rounded-full font-semibold', bgColor, textColor, hoverTextColor, hoverBgColor]"
    @click="navigate"
  >
    <slot />
  </button>
</template>

<script>
export default {
  props: {
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
  },
  methods: {
    navigate() {
      if (this.to) {
        this.$router.push(this.to);
      }
    },
  },
};
</script>