# OneMind OS — Full Architecture

## System Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         OneMind OS                                   │
│                    https://atoc.onemindos.dev                        │
│              (one URL, one login, one pane of glass)                 │
└─────────────────────────────────────────────────────────────────────┘

FRONTEND (Vue 3 + Vite 8 + TypeScript 6 + MapLibre GL 6)
─────────────────────────────────────────────────────────
┌──────────────────────────────────────────────────────────────────────┐
│  LEFT NAV (routes)    │   CENTER (map + pages)    │  RIGHT (panels)  │
│  ──────────────────   │   ─────────────────────   │  ──────────────  │
│  /map (default)       │   MapLibre GL             │  Legacy AI Chat  │
│  /missions            │   CoT contacts            │  Tool cards      │
│  /video               │   MIL-STD-2525 symbols    │  Approve/Deny    │
│  /intel               │   Draw tools              │                  │
│  /fleet               │   Geofences               │  BOTTOM BAR      │
│  /home                │   Video overlays          │  ──────────────  │
│  /fabric              │   Intel overlays          │  Bus health      │
│  /agents              │                           │  AI status       │
│  /timemachine         │   (or full-page route)    │  Active streams  │
│  /voice               │                           │  Device battery  │
│  /terminal            │                           │                  │
│  /services            │                           │                  │
│  /community           │                           │                  │
│  /agriculture         │                           │                  │
│  /settings            │                           │                  │
└──────────────────────────────────────────────────────────────────────┘

BACKEND (Node.js 24+ / Express 5 / TypeScript)
──────────────────────────────────────────────
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│  EXISTING CLOUDTAK BACKEND                                           │
│  ├── 70+ REST routes (stateless)                                     │
│  ├── WebSocket hub (stateful) — real-time CoT streaming              │
│  ├── Drizzle ORM + PostgreSQL + PostGIS                              │
│  ├── @tak-ps/node-cot + node-tak (TAK protocol)                      │
│  ├── @tak-ps/etl (data pipeline engine)                              │
│  ├── MediaMTX integration (RTSP/RTMP/HLS video)                      │
│  ├── MinIO (S3-compatible sovereign storage)                          │
│  ├── Tile38 (real-time geo queries)                                   │
│  ├── JWT + WebAuthn + TOTP auth                                       │
│  └── Sharp + spritesmith (icons/image processing)                     │
│                                                                      │
│  NEW: NATS BRIDGE SERVICE                                             │
│  ├── NATS client → nats.nats.svc.cluster.local:4222                  │
│  ├── WebSocket endpoint: /api/ws/nats (frontend subscribes)           │
│  ├── Subscribes: intel.*, fleet.*, home.*, agents.*, fabric.*         │
│  ├── Publishes: user commands, map actions                            │
│  ├── New routes: /api/fabric/*, /api/agents/*, /api/fleet/*           │
│  └── Bridges NATS events → CoT markers on map                        │
│                                                                      │
│  STRIPPED:                                                            │
│  ├── AWS CloudFormation (we use Helm/ArgoCD)                          │
│  ├── AWS Lambda/SQS/ECR (we use DOKS directly)                        │
│  └── AWS SecretsManager (we use 1Password + ESO)                      │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘

NATS BUS (K8s cluster — the nervous system)
─────────────────────────────────────────────
┌──────────────────────────────────────────────────────────────────────┐
│  SUBJECTS:                                                           │
│  intel.*        → ShadowBroker, WorldMonitor, ACLED, FIRMS, NOAA     │
│  tak.cot.*      → All CoT events (bidirectional TAK bridge)          │
│  agents.*       → Legacy + all AI agents                             │
│  fleet.*        → dimos robots, drones, MAVLink                      │
│  home.*         → Home Assistant entities                            │
│  fabric.*       → NATS bus health, connections, streams              │
│  tel.*          → Telemetry (sensors, devices)                       │
│  det.*          → Detections (air, ground, maritime)                 │
│  evt.*          → Semantic events (mission complete, alert)          │
│  cmd.*          → Commands (drone intercept, lock door)              │
│  ent.*          → Fused entity state (ORP output)                    │
└──────────────────────────────────────────────────────────────────────┘

DATA SOURCES
────────────
┌─────────────────────────────────┐   ┌─────────────────────────────┐
│  omos-intel droplet             │   │  Edge Devices               │
│  ├── ShadowBroker (ADS-B)      │   │  ├── S24 Ultra (ATAK)       │
│  ├── WorldMonitor (AIS ships)   │   │  ├── HelmCam (USB action)   │
│  ├── Osiris (OSINT)            │   │  ├── TAKCam (phone cam)     │
│  ├── WorldwideView (geospatial)│   │  ├── Home Assistant         │
│  └── Crucix (intel fusion)     │   │  ├── dimos robots           │
│      ↓                          │   │  ├── MAVLink drones         │
│  NATS → intel.* subjects        │   │  └── Sensors, IoT           │
└─────────────────────────────────┘   │      ↓                       │
                                      │  NATS → fleet.*, home.*, tel.*│
                                      └─────────────────────────────┘
```

## Tech Stack Summary

### Frontend
| Library | Version | Purpose |
|---------|---------|---------|
| Vue 3 | ^3.2 | UI framework |
| Vite 8 | ^8.0 | Build tool (Rolldown bundler) |
| TypeScript | ^6.0 | Language |
| Pinia 4 | ^4.0 | State management |
| Vue Router 5 | ^5.0 | Routing |
| MapLibre GL | ^6.0 | Map rendering |
| Terra Draw | ^1.22 | Draw/edit tools on map |
| milsymbol | ^3.0 | Military symbols (MIL-STD-2525) |
| Tabler | ^1.4 | CSS framework + icons |
| Dexie | ^4.2 | IndexedDB (offline cache) |
| Comlink | ^4.4 | Web Worker communication |
| HLS.js | ^1.6 | Video streaming |
| Chart.js | ^4.5 | Charts/dashboards |
| Capacitor 8 | ^8.x | iOS/Android mobile wrapper |

### Backend
| Library | Version | Purpose |
|---------|---------|---------|
| Node.js | >= 24 | Runtime |
| Express | ^5.0 | HTTP framework |
| TypeScript | ^5.x | Language |
| Drizzle ORM | ^0.45 | Database ORM |
| PostgreSQL + PostGIS | 17 | Database + spatial |
| ws | ^8.11 | WebSocket |
| @tak-ps/node-cot | ^14.48 | CoT protocol |
| @tak-ps/node-tak | ^12.23 | TAK protocol |
| @tak-ps/etl | ^10.0 | ETL engine |
| jsonwebtoken | ^9.0 | Auth |
| sharp | ^0.35 | Image processing |
| Tile38 | - | Real-time geo queries |
| MinIO | - | S3-compatible storage |
| NATS.js | (to add) | Bus integration |

### Infrastructure
| Tool | Purpose |
|------|---------|
| DOKS (DigitalOcean K8s) | Cluster |
| ArgoCD | GitOps deployment |
| GHCR | Container registry |
| Cloudflare Tunnel | Public HTTPS |
| 1Password + ESO | Secret management |
| NATS 3-node HA | Message bus |
| ClickHouse | Time-series history |
| MediaMTX | RTSP/RTMP/HLS video |

