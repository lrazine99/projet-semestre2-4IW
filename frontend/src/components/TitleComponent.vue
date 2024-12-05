<template>
    <h1
        class="mb-4 text-3xl font-extrabold tracking-tight font-manrope leading-snug text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-pink-600 to-purple-600 md:text-4xl lg:text-5xl ">
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