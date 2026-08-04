<template>
    <div class="col-12 px-3 py-3">
        <!-- Connection Status Card -->
        <div class="card mb-3" style="background: rgba(0, 212, 255, 0.05); border: 1px solid rgba(0, 212, 255, 0.2);">
            <div class="card-body p-3">
                <div class="d-flex align-items-center justify-content-between mb-2">
                    <h4 class="card-title mb-0" style="color: #00d4ff;">
                        ⚡ Connection
                    </h4>
                    <span
                        class="badge"
                        :style="{
                            backgroundColor: status.connected ? 'rgba(67, 226, 125, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                            color: status.connected ? '#43e27d' : '#ef4444',
                            border: '1px solid ' + (status.connected ? '#43e27d' : '#ef4444'),
                        }"
                    >
                        {{ status.connected ? 'Connected' : 'Disconnected' }}
                    </span>
                </div>
                <div class="row g-2">
                    <div class="col-6">
                        <div class="text-muted" style="font-size: 11px;">Server</div>
                        <div class="text-white" style="font-size: 13px;">{{ status.server || 'N/A' }}</div>
                    </div>
                    <div class="col-6">
                        <div class="text-muted" style="font-size: 11px;">Subjects</div>
                        <div class="text-white" style="font-size: 13px;">{{ status.subjects?.length || 0 }} subscribed</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Subjects List -->
        <div class="card mb-3" style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.1);">
            <div class="card-body p-3">
                <h4 class="card-title mb-2">Subscribed Subjects</h4>
                <div v-if="status.subjects && status.subjects.length > 0">
                    <div
                        v-for="subject in status.subjects"
                        :key="subject"
                        class="d-flex align-items-center py-1 px-2 mb-1 rounded"
                        style="background: rgba(255,255,255,0.03); font-family: monospace; font-size: 12px;"
                    >
                        <span class="text-muted me-2">⤷</span>
                        <span style="color: #00d4ff;">{{ subject }}</span>
                    </div>
                </div>
                <div v-else class="text-muted" style="font-size: 12px;">
                    No active subscriptions
                </div>
            </div>
        </div>

        <!-- Quick Publish -->
        <div class="card mb-3" style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.1);">
            <div class="card-body p-3">
                <h4 class="card-title mb-2">Quick Publish</h4>
                <div class="mb-2">
                    <input
                        v-model="publishSubject"
                        type="text"
                        class="form-control form-control-sm"
                        placeholder="Subject (e.g., tak.cot.inject)"
                        style="background: rgba(0,0,0,0.3); border-color: rgba(255,255,255,0.1); color: white;"
                    >
                </div>
                <div class="mb-2">
                    <textarea
                        v-model="publishData"
                        class="form-control form-control-sm"
                        rows="3"
                        placeholder='{"type": "test", "data": "hello"}'
                        style="background: rgba(0,0,0,0.3); border-color: rgba(255,255,255,0.1); color: white; font-family: monospace; font-size: 12px;"
                    />
                </div>
                <button
                    class="btn btn-sm w-100"
                    :disabled="!publishSubject || !publishData || publishing"
                    style="background: rgba(0, 212, 255, 0.15); color: #00d4ff; border: 1px solid rgba(0, 212, 255, 0.3);"
                    @click="doPublish"
                >
                    {{ publishing ? 'Publishing...' : 'Publish to NATS' }}
                </button>
                <div v-if="publishResult" class="mt-2 text-success" style="font-size: 11px;">
                    ✓ Published to {{ publishResult }}
                </div>
                <div v-if="publishError" class="mt-2 text-danger" style="font-size: 11px;">
                    ✗ {{ publishError }}
                </div>
            </div>
        </div>

        <!-- Recent Messages (placeholder) -->
        <div class="card" style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.1);">
            <div class="card-body p-3">
                <div class="d-flex align-items-center justify-content-between mb-2">
                    <h4 class="card-title mb-0">Recent Messages</h4>
                    <span class="badge bg-secondary">{{ messages.length }}</span>
                </div>
                <div v-if="messages.length === 0" class="text-muted" style="font-size: 12px;">
                    Messages will appear here when NATS WebSocket is active
                </div>
                <div v-else class="overflow-auto" style="max-height: 200px;">
                    <div
                        v-for="(msg, i) in messages"
                        :key="i"
                        class="py-1 px-2 mb-1 rounded"
                        style="background: rgba(255,255,255,0.03); font-size: 11px;"
                    >
                        <div class="d-flex justify-content-between">
                            <span style="color: #00d4ff; font-family: monospace;">{{ msg.subject }}</span>
                            <span class="text-muted">{{ msg.time }}</span>
                        </div>
                        <div class="text-truncate text-muted" style="font-family: monospace;">
                            {{ msg.data }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue';

interface NatsStatus {
    connected: boolean;
    server: string;
    subjects: string[];
    messageCount: number;
}

interface NatsMessage {
    subject: string;
    data: string;
    time: string;
}

const status = reactive<NatsStatus>({
    connected: false,
    server: '',
    subjects: [],
    messageCount: 0,
});

const messages = ref<NatsMessage[]>([]);
const publishSubject = ref('');
const publishData = ref('');
const publishing = ref(false);
const publishResult = ref('');
const publishError = ref('');

let statusInterval: ReturnType<typeof setInterval> | null = null;
let ws: WebSocket | null = null;

async function fetchStatus() {
    try {
        const res = await fetch('/api/omos/status');
        if (res.ok) {
            const data = await res.json();
            status.connected = data.connected ?? false;
            status.server = data.server ?? '';
            status.subjects = data.subjects ?? [];
            status.messageCount = data.messageCount ?? 0;
        }
    } catch {
        status.connected = false;
    }
}

function connectWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/api/ws/nats`;

    try {
        ws = new WebSocket(wsUrl);
        ws.onmessage = (event) => {
            try {
                const msg = JSON.parse(event.data);
                if (msg.type === 'message') {
                    messages.value.unshift({
                        subject: msg.subject || 'unknown',
                        data: typeof msg.data === 'string' ? msg.data : JSON.stringify(msg.data),
                        time: new Date().toLocaleTimeString(),
                    });
                    // Keep max 50 messages
                    if (messages.value.length > 50) {
                        messages.value = messages.value.slice(0, 50);
                    }
                }
            } catch { /* ignore parse errors */ }
        };
        ws.onclose = () => {
            // Reconnect after 3s
            setTimeout(connectWebSocket, 3000);
        };
    } catch { /* ignore */ }
}

async function doPublish() {
    publishing.value = true;
    publishResult.value = '';
    publishError.value = '';

    try {
        const res = await fetch('/api/omos/publish', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                subject: publishSubject.value,
                data: publishData.value,
            }),
        });

        if (res.ok) {
            publishResult.value = publishSubject.value;
            setTimeout(() => { publishResult.value = ''; }, 3000);
        } else {
            const err = await res.json();
            publishError.value = err.error || 'Failed to publish';
        }
    } catch (e) {
        publishError.value = String(e);
    }

    publishing.value = false;
}

onMounted(() => {
    fetchStatus();
    statusInterval = setInterval(fetchStatus, 5000);
    connectWebSocket();
});

onUnmounted(() => {
    if (statusInterval) clearInterval(statusInterval);
    if (ws) ws.close();
});
</script>
