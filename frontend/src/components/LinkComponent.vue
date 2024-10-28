<template>
    <a
        :class="['cursor-pointer', textColor, fontWeight, hoverTextColor]"
        @click="navigate"
    >
        <slot />
    </a>
</template>

<script>
export default {
  props: {
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