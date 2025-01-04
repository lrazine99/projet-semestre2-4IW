<template>


    <h1
        class="text-4xl mb-5 text-center text-gray-800 font-extrabold bg-clip-text text-transparent bg-[linear-gradient(to_right,theme(colors.indigo.600),theme(colors.indigo.400),theme(colors.sky.600),theme(colors.fuchsia.600),theme(colors.sky.600),theme(colors.indigo.400),theme(colors.indigo.600))] bg-[length:200%_auto] animate-gradient">
        {{ titleText }}


    </h1>

</template>

<script setup>
defineProps({
    titleText: {
        type: String,
        required: true
    }
})
</script>