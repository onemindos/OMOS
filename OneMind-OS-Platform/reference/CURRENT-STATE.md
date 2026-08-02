# Reference: What We Are Combining

## omos-ui Current Pages (React 19 + TypeScript + TanStack Router + Zustand)

Source: /opt/data/repos/omos-ui
Live: https://onemindos.dev
Stack: React 19, Vite, TanStack Router, Zustand, NATS WebSocket, Cesium JS

### Active Routes (14 pages)

COMMAND Section:
- /overview — NATS bus metrics, agent roster, system status cards
- /services — Tile-based service launcher, health monitoring
- /bus — NATS Management (6 tabs: Topology, Connections, Explorer, Streams, KV, Publish)
- /agents — Agent roster, per-agent chat, wire traffic, NATS tap
- /missions — Mission list, create, detail, actor assignment, task graph

OPERATIONS Section:
- /integrations — Status cards: CloudTAK, WorldWideView, HA, MAVLink, Vision
- /streams — NATS Streams (legacy alias)
- /intel — Intel Feed, Entity Graph, World Feeds, ORP Browser, Threats, AI Analyst, Regions
- /replay — NATS message replay with time controls

SYSTEM Section:
- /security — Live NATS $SYS event monitor (auth failures, permission denied)
- /wire — Raw NATS traffic tap (frame type badges, subject filter)
- /terminal — Multi-tab xterm.js terminal
- /voice — Push-to-talk, agent voice cards, transcript
- /settings — Connection profiles, appearance, notifications

### Built But Not Wired:
- /fleet — Node/device/drone roster, telemetry, command panel
- /tasks — Inbox, Board, Calendar task management
- /timemachine — ClickHouse SQL editor, results, time-series, schema explorer
- /map — CloudTAK/WorldWideView iframe embed + entity counts

## CloudTAK Current Stack (what we fork)

Image: ghcr.io/onemindos/cloudtak-api:latest
Source: dfpc-coe/CloudTAK (upstream)
Version: 13.57.3

### Backend (Node.js 24+ / TypeScript)
- Express 5.0 — HTTP framework
- Drizzle ORM 0.45 — PostgreSQL + PostGIS
- @tak-ps/node-cot 14.48 — CoT protocol
- @tak-ps/node-tak 12.23 — TAK protocol
- @tak-ps/etl 10.0 — ETL pipeline engine
- ws 8.11 — WebSocket (stateful hub)
- jsonwebtoken 9.0 — JWT auth
- @simplewebauthn/server 13.3 — Passkeys
- sharp 0.35 — Image processing
- Tile38 — Real-time geospatial queries
- MinIO — S3-compatible storage

### Frontend (Vue 3 / TypeScript)
- Vue 3.2 — Framework
- Vite 8.0 (Rolldown) — Build
- TypeScript 6.0 — Language
- Pinia 4.0 — State management
- Vue Router 5.0 — Routing
- MapLibre GL 6.0 — Map
- terra-draw 1.22 — Draw tools
- milsymbol 3.0 — Military symbols
- Tabler 1.4 — CSS framework + icons
- Dexie 4.2 — IndexedDB
- Comlink 4.4 — Web Worker proxy
- HLS.js 1.6 — Video
- Chart.js 4.5 — Charts
- Capacitor 8.x — Mobile (iOS/Android)
- 6 Atlas Web Workers — CoT processing

### 70+ API Routes (stateless)
agency, basemap, config, connection, core-event, esri, fonts,
geofence, icons, import, layer-template, ldap, login, login-passkey,
manifest, marti-missions, marti-files, marti-video, marti-export,
marti-packages, marti-subscriptions, mission-template, profile,
profile-asset, profile-chat, profile-features, profile-interest,
profile-location, profile-overlays, profile-paging, profile-token,
profile-videos, proxy, retention, search, server, task, types, users,
video-lease, videos, ...and more

### Server Modes
- both: stateful (WebSocket hub) + stateless (REST) in one process
- api: stateless REST only
- hub: stateful WebSocket hub only

## CloudTAK Plugin API

Plugins get access to:
- api.routes — add Vue Router routes
- api.menu — add left nav items
- api.float — add floating panels
- api.bottomBar — add bottom bar widgets
- api.router — direct Vue Router access
- api.map — direct MapLibre map instance
- api.stores — Pinia stores (app, map, device)

## omos-intel (Droplet: 159.203.98.158 / 100.114.216.80)

| Service | Port | Purpose |
|---------|------|---------|
| WorldMonitor | :3001 | AIS ship tracking |
| ShadowBroker | :3004/:8001 | ADS-B aircraft + intel |
| Osiris | :3002 | OSINT platform |
| WorldwideView | :3003 | Geospatial analysis |
| Crucix | :3117 | Intel fusion |

