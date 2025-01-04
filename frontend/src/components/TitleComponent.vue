<template>


    <h1
        class="text-4xl  mb-5 text-center text-gray-800 font-extrabold bg-clip-text text-transparent bg-[linear-gradient(to_right,theme(colors.indigo.400),theme(colors.indigo.100),theme(colors.sky.400),theme(colors.fuchsia.400),theme(colors.sky.400),theme(colors.indigo.100),theme(colors.indigo.400))] bg-[length:200%_auto] animate-gradient">

        {{ titleText }}</h1>

</template>

<script setup>
defineProps({
    titleText: {
        type: String,
        required: true
    }
})
</script>