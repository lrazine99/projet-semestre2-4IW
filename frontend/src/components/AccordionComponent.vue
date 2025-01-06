<template>
  <div v-if="accordionConfig.length" id="accordion-collapse" data-accordion="collapse">
    <div v-for="(item, index) in accordionConfig" :key="index">

      <h2 :id="`accordion-collapse-heading-${index + 1}`" class="my-2">
        <button type="button" class="flex items-center font-bold justify-between w-full p-5  rtl:text-right text-gray-800 border
        border-black focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-800 dark:text-gray-400 hover:bg-gray-100
        dark:hover:bg-gray-800 gap-3" :data-accordion-target="`#accordion-collapse-body-${index + 1}`"
          aria-expanded="false" :aria-controls="`accordion-collapse-body-${index + 1}`" @click="toggleAccordion(index)">
          <span>{{ item.title }}</span>
          <svg :class="{'rotate-180': activeIndex === index}" data-accordion-icon class="w-3 h-3 shrink-0" aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 5 5 1 1 5" />
          </svg>
        </button>
      </h2>
      <div :id="`accordion-collapse-body-${index + 1}`" :class="{'hidden': activeIndex !== index, 'block': activeIndex === index}" class="my-2 bg-gray-100"
        :aria-labelledby="`accordion-collapse-heading-${index + 1}`">
        <div class="p-5 border border-black ">
          <component :is="item.component"></component>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const { accordionConfig } = defineProps({
  accordionConfig: {
    type: Array,
    required: true,
  },
});

const activeIndex = ref(null);

const toggleAccordion = (index) => {
  activeIndex.value = activeIndex.value === index ? null : index;
};
</script>




