<template>
    <div v-if="isVisible"
        class="fixed inset-0 bg-white bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50">
        <div class="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
</template>

<script setup>
const { isVisible } = defineProps({
    isVisible: {
        type: Boolean,
        required: true,
    },
});
</script>