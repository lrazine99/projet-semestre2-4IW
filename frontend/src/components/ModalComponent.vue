<template>
    <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        @click.self="closeModal">
        <div class="bg-white rounded-lg shadow-lg w-96 p-6 relative">
            <!-- Modal Header -->
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-semibold">{{ title }}</h3>
                <!-- Close Button -->
                <button @click="closeModal" class="text-gray-500 hover:text-gray-700 text-xl font-bold"
                    aria-label="Close modal">
                    &times;
                </button>
            </div>
            <div>
                <slot></slot>
            </div>

            
        </div>
    </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';
import { ref } from 'vue';

defineProps({
    title: { type: String, default: 'Modal Title' },
    visible: { type: Boolean, default: false },
    hideFooter: { type: Boolean, default: false },
    onConfirm: { type: Function, default: null },
});

const emit = defineEmits(['close']);

const closeModal = () => {
    emit('close'); // Emits the close event to the parent
};

</script>