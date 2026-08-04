<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        :width="size"
        :height="size"
        viewBox="0 0 24 24"
        fill="none"
        :stroke="color"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
    >
        <!-- Lightning bolt / pulse for NATS -->
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
</template>

<script setup lang="ts">
defineProps({
    size: { type: Number, default: 32 },
    color: { type: String, default: 'currentColor' },
});
</script>
