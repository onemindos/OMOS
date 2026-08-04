<template>
    <div
        class="d-flex align-items-center gap-1 px-2 cursor-pointer user-select-none"
        title="NATS Bus Status"
        @click="navigateToNats"
    >
        <span
            class="rounded-circle d-inline-block"
            :style="{
                width: '8px',
                height: '8px',
                backgroundColor: statusColor,
                boxShadow: connected ? '0 0 4px ' + statusColor : 'none',
            }"
        />
        <span class="text-white" style="font-size: 11px;">
            NATS {{ connected ? '●' : '○' }}
        </span>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const connected = ref(false);
const messageCount = ref(0);
let statusInterval: ReturnType<typeof setInterval> | null = null;

const statusColor = computed(() => connected.value ? '#43e27d' : '#ef4444');

async function checkStatus() {
    try {
        const res = await fetch('/api/omos/status');
        if (res.ok) {
            const data = await res.json();
            connected.value = data.connected ?? false;
            messageCount.value = data.messageCount ?? 0;
        } else {
            connected.value = false;
        }
    } catch {
        connected.value = false;
    }
}

function navigateToNats() {
    router.push({ name: 'home-menu-onemind-nats' });
}

onMounted(() => {
    checkStatus();
    statusInterval = setInterval(checkStatus, 5000);
});

onUnmounted(() => {
    if (statusInterval) clearInterval(statusInterval);
});
</script>
