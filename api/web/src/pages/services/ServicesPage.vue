<template>
    <div class='services-page'>
        <!-- Header -->
        <header class='services-header'>
            <div class='header-left'>
                <a
                    href='/'
                    class='back-link'
                    title='Back to Map'
                >
                    <svg
                        width='20'
                        height='20'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        stroke-width='2'
                    >
                        <path d='M19 12H5M12 19l-7-7 7-7' />
                    </svg>
                </a>
                <div>
                    <h1 class='header-title'>
                        Services
                    </h1>
                    <p class='header-subtitle'>
                        {{ filteredTiles.length }} service{{ filteredTiles.length !== 1 ? 's' : '' }}
                    </p>
                </div>
            </div>
            <div class='header-right'>
                <button
                    class='icon-btn'
                    :title='isGridView ? "List view" : "Grid view"'
                    @click='toggleView'
                >
                    <svg
                        v-if='isGridView'
                        width='16'
                        height='16'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        stroke-width='2'
                    >
                        <line
                            x1='8'
                            y1='6'
                            x2='21'
                            y2='6'
                        /><line
                            x1='8'
                            y1='12'
                            x2='21'
                            y2='12'
                        /><line
                            x1='8'
                            y1='18'
                            x2='21'
                            y2='18'
                        />
                        <line
                            x1='3'
                            y1='6'
                            x2='3.01'
                            y2='6'
                        /><line
                            x1='3'
                            y1='12'
                            x2='3.01'
                            y2='12'
                        /><line
                            x1='3'
                            y1='18'
                            x2='3.01'
                            y2='18'
                        />
                    </svg>
                    <svg
                        v-else
                        width='16'
                        height='16'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        stroke-width='2'
                    >
                        <rect
                            x='3'
                            y='3'
                            width='7'
                            height='7'
                        /><rect
                            x='14'
                            y='3'
                            width='7'
                            height='7'
                        />
                        <rect
                            x='3'
                            y='14'
                            width='7'
                            height='7'
                        /><rect
                            x='14'
                            y='14'
                            width='7'
                            height='7'
                        />
                    </svg>
                </button>
            </div>
        </header>

        <!-- Search -->
        <div class='search-container'>
            <svg
                class='search-icon'
                width='14'
                height='14'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                stroke-width='2'
            >
                <circle
                    cx='11'
                    cy='11'
                    r='8'
                /><line
                    x1='21'
                    y1='21'
                    x2='16.65'
                    y2='16.65'
                />
            </svg>
            <input
                v-model='query'
                class='search-input'
                placeholder='Search services...'
            >
            <button
                v-if='query'
                class='search-clear'
                @click='query = ""'
            >
                ✕
            </button>
        </div>

        <!-- Categories -->
        <main class='services-content'>
            <section
                v-for='category in orderedCategories'
                :key='category'
                class='category-section'
            >
                <div class='category-header'>
                    <span class='category-label'>{{ category }}</span>
                    <span class='category-count'>{{ groups.get(category)?.length || 0 }}</span>
                </div>

                <!-- Grid View -->
                <div
                    v-if='isGridView'
                    class='tiles-grid'
                >
                    <div
                        v-for='tile in groups.get(category)'
                        :key='tile.id'
                        class='tile-card'
                        :style='{ "--accent": tile.accent }'
                        @click='openService(tile)'
                    >
                        <div class='tile-top'>
                            <div
                                class='tile-emoji'
                                :style='{ background: tile.accent + "22" }'
                            >
                                {{ tile.emoji }}
                                <span
                                    v-if='statuses.has(tile.id)'
                                    class='status-dot'
                                    :class='statuses.get(tile.id)'
                                />
                            </div>
                        </div>
                        <div class='tile-name'>
                            {{ tile.name }}
                        </div>
                        <div class='tile-desc'>
                            {{ tile.description }}
                        </div>
                        <div class='tile-url'>
                            {{ tile.url.replace(/^https?:\/\//, "") }}
                        </div>
                    </div>
                </div>

                <!-- List View -->
                <div
                    v-else
                    class='tiles-list'
                >
                    <div
                        v-for='tile in groups.get(category)'
                        :key='tile.id'
                        class='tile-row'
                        :style='{ "--accent": tile.accent }'
                        @click='openService(tile)'
                    >
                        <span class='tile-row-emoji'>{{ tile.emoji }}</span>
                        <div class='tile-row-info'>
                            <span class='tile-row-name'>{{ tile.name }}</span>
                            <span class='tile-row-desc'>{{ tile.description }}</span>
                        </div>
                        <span class='tile-row-url'>{{ tile.url.replace(/^https?:\/\//, "") }}</span>
                        <span
                            v-if='statuses.has(tile.id)'
                            class='status-dot-inline'
                            :class='statuses.get(tile.id)'
                        />
                    </div>
                </div>
            </section>
        </main>
    </div>
</template>

<script setup lang='ts'>
import { ref, computed, onMounted, onUnmounted } from 'vue';

interface ServiceTile {
    id: string;
    name: string;
    description: string;
    url: string;
    accent: string;
    emoji: string;
    category: string;
}

const DEFAULTS: ServiceTile[] = [
    // Tactical
    { id: 'cloudtak', name: 'CloudTAK', description: 'TAK COP & WebTAK', url: 'https://atoc.onemindos.dev', accent: '#ef4444', emoji: '🎯', category: 'Tactical' },
    { id: 'takserver', name: 'TAK Server', description: 'Tactical awareness server', url: 'https://152.42.155.95:8446', accent: '#dc2626', emoji: '📡', category: 'Tactical' },
    { id: 'wwv', name: 'WorldWideView', description: 'Strategic globe & orbital view', url: 'https://wwv.onemindos.dev', accent: '#c084fc', emoji: '🌍', category: 'Tactical' },
    // Platform
    { id: 'nats-mon', name: 'NATS Monitor', description: 'NATS server monitoring', url: 'https://nats-mon.onemindos.dev', accent: '#00d4ff', emoji: '📈', category: 'Platform' },
    { id: 'argocd', name: 'ArgoCD', description: 'GitOps continuous delivery', url: 'https://argocd.onemindos.dev', accent: '#f97316', emoji: '🚀', category: 'Platform' },
    { id: 'grafana', name: 'Grafana', description: 'Metrics, logs & traces', url: 'https://grafana.onemindos.dev', accent: '#f59e0b', emoji: '📊', category: 'Platform' },
    // Agents
    { id: 'hermes', name: 'Hermes', description: 'AI agent & workflow UI', url: 'https://hermes.onemindos.dev', accent: '#22d3ee', emoji: '⚡', category: 'Agents' },
    { id: 'hermes-local', name: 'Hermes Local', description: 'Hermes on MacBook (edge)', url: 'http://omos-mbp.tail717ba0.ts.net:8787', accent: '#0ea5e9', emoji: '💻', category: 'Agents' },
    // Cloud
    { id: 'digitalocean', name: 'DigitalOcean', description: 'DOKS cluster & cloud infra', url: 'https://cloud.digitalocean.com/kubernetes/clusters', accent: '#0080ff', emoji: '🌊', category: 'Cloud' },
    { id: 'aws', name: 'AWS', description: 'Amazon Web Services console', url: 'https://us-east-1.console.aws.amazon.com/console/', accent: '#f97316', emoji: '☁️', category: 'Cloud' },
    { id: 'tailscale', name: 'Tailscale', description: 'Mesh VPN admin', url: 'https://login.tailscale.com/admin/machines', accent: '#7c3aed', emoji: '🔒', category: 'Cloud' },
    { id: 'cloudflare', name: 'Cloudflare', description: 'CDN, DNS & tunnels', url: 'https://dash.cloudflare.com', accent: '#f6821f', emoji: '🟠', category: 'Cloud' },
    // Dev
    { id: 'gh-onemind', name: 'GitHub / OneMind', description: 'OneMind OS org', url: 'https://github.com/onemindos', accent: '#e2e8f0', emoji: '🐙', category: 'Dev' },
    { id: 'gh-zeus', name: 'GitHub / Zeus', description: 'Personal GitHub', url: 'https://github.com/Zeus-Delacruz', accent: '#94a3b8', emoji: '🐙', category: 'Dev' },
    // Identity & Ops
    { id: 'onemind-site', name: 'OneMind OS', description: 'Public site', url: 'https://weareonemind.com', accent: '#00d4ff', emoji: '🚀', category: 'Identity & Ops' },
    { id: 'mercury', name: 'Mercury Bank', description: 'Business banking', url: 'https://app.mercury.com/panorama', accent: '#10b981', emoji: '💳', category: 'Identity & Ops' },
    { id: '1password', name: '1Password', description: 'Password manager', url: 'https://my.1password.com', accent: '#1a8cff', emoji: '🔑', category: 'Identity & Ops' },
];

type StatusState = 'up' | 'down' | 'pending';

const tiles = ref<ServiceTile[]>(DEFAULTS);
const query = ref('');
const viewMode = ref<'grid' | 'compact'>('grid');
const statuses = ref<Map<string, StatusState>>(new Map());

const filteredTiles = computed(() => {
    if (!query.value.trim()) return tiles.value;
    const q = query.value.toLowerCase();
    return tiles.value.filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
    );
});

const groups = computed(() => {
    const map = new Map<string, ServiceTile[]>();
    for (const t of filteredTiles.value) {
        if (!map.has(t.category)) map.set(t.category, []);
        map.get(t.category)!.push(t);
    }
    return map;
});

const orderedCategories = computed(() => [...groups.value.keys()]);

const isGridView = computed(() => viewMode.value === 'grid');

function toggleView() {
    viewMode.value = viewMode.value === 'grid' ? 'compact' : 'grid';
}

function openService(tile: ServiceTile) {
    window.open(tile.url, '_blank', 'noopener,noreferrer');
}

let probeInterval: ReturnType<typeof setInterval> | null = null;

function isMonitored(url: string): boolean {
    return /\.tail[a-z0-9]+\.ts\.net/i.test(url) ||
           /^https?:\/\/(10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.|146\.|152\.)/.test(url) ||
           url.includes('onemindos.dev');
}

async function probeStatuses() {
    const monitored = tiles.value.filter(t => isMonitored(t.url));
    for (const tile of monitored) {
        try {
            const ctrl = new AbortController();
            const timer = setTimeout(() => ctrl.abort(), 4000);
            await fetch(tile.url, { method: 'HEAD', mode: 'no-cors', signal: ctrl.signal });
            clearTimeout(timer);
            statuses.value.set(tile.id, 'up');
        } catch {
            statuses.value.set(tile.id, 'down');
        }
    }
}

onMounted(() => {
    probeStatuses();
    probeInterval = setInterval(probeStatuses, 60000);
});

onUnmounted(() => {
    if (probeInterval) clearInterval(probeInterval);
});
</script>

<style scoped>
.services-page {
    min-height: 100vh;
    background: #0a0a0f;
    color: #e2e8f0;
    padding: 24px;
    max-width: 1200px;
    margin: 0 auto;
}
.services-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
}
.header-left { display: flex; align-items: center; gap: 12px; }
.back-link {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 8px;
    border: 1px solid rgba(255,255,255,0.1);
    color: #94a3b8;
    text-decoration: none;
    transition: all 0.15s;
}
.back-link:hover { background: rgba(255,255,255,0.05); color: white; }
.header-title { font-size: 18px; font-weight: 700; margin: 0; }
.header-subtitle { font-size: 12px; color: #64748b; margin: 2px 0 0; }
.header-right { display: flex; gap: 8px; }
.icon-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;
    border-radius: 8px;
    border: 1px solid rgba(255,255,255,0.1);
    background: transparent;
    color: #94a3b8;
    cursor: pointer;
    transition: all 0.15s;
}
.icon-btn:hover { background: rgba(255,255,255,0.05); color: white; }
.search-container { position: relative; margin-bottom: 24px; }
.search-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #64748b;
}
.search-input {
    width: 100%;
    padding: 10px 36px;
    border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.03);
    color: #e2e8f0;
    font-size: 14px;
    outline: none;
    box-sizing: border-box;
}
.search-input:focus { border-color: rgba(0, 212, 255, 0.4); }
.search-clear {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: #64748b;
    cursor: pointer;
}
.services-content { display: flex; flex-direction: column; gap: 28px; }
.category-header { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
.category-label {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #64748b;
}
.category-count {
    font-size: 10px;
    color: #475569;
    background: rgba(255,255,255,0.05);
    padding: 1px 6px;
    border-radius: 4px;
}
.tiles-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 12px;
}
.tile-card {
    position: relative;
    padding: 16px;
    border-radius: 12px;
    border: 1px solid color-mix(in srgb, var(--accent) 20%, transparent);
    background: color-mix(in srgb, var(--accent) 4%, transparent);
    cursor: pointer;
    transition: all 0.15s;
}
.tile-card:hover {
    background: color-mix(in srgb, var(--accent) 10%, transparent);
    transform: translateY(-1px);
}
.tile-top { margin-bottom: 10px; }
.tile-emoji {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 38px;
    height: 38px;
    border-radius: 8px;
    font-size: 18px;
}
.status-dot {
    position: absolute;
    bottom: -2px;
    right: -2px;
    width: 9px;
    height: 9px;
    border-radius: 50%;
    border: 2px solid #0a0a0f;
}
.status-dot.up { background: #43e27d; box-shadow: 0 0 4px #43e27d; }
.status-dot.down { background: #ef4444; }
.status-dot.pending { background: #94a3b8; }
.tile-name { font-size: 13px; font-weight: 600; margin-bottom: 2px; }
.tile-desc {
    font-size: 11px;
    color: #64748b;
    margin-bottom: 8px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
.tile-url {
    font-size: 10px;
    font-family: monospace;
    color: color-mix(in srgb, var(--accent) 70%, white);
    background: rgba(0,0,0,0.3);
    padding: 2px 8px;
    border-radius: 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.tiles-list { display: flex; flex-direction: column; gap: 4px; }
.tile-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 12px;
    border-radius: 8px;
    border: 1px solid color-mix(in srgb, var(--accent) 15%, transparent);
    border-left: 2px solid var(--accent);
    background: color-mix(in srgb, var(--accent) 3%, transparent);
    cursor: pointer;
    transition: all 0.15s;
}
.tile-row:hover { background: color-mix(in srgb, var(--accent) 8%, transparent); }
.tile-row-emoji { font-size: 16px; }
.tile-row-info { flex: 1; min-width: 0; }
.tile-row-name { font-size: 13px; font-weight: 500; }
.tile-row-desc { font-size: 11px; color: #64748b; margin-left: 8px; }
.tile-row-url {
    font-size: 10px;
    font-family: monospace;
    color: color-mix(in srgb, var(--accent) 60%, white);
    max-width: 140px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.status-dot-inline {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
}
.status-dot-inline.up { background: #43e27d; box-shadow: 0 0 4px #43e27d; }
.status-dot-inline.down { background: #ef4444; }
.status-dot-inline.pending { background: #94a3b8; }
</style>
