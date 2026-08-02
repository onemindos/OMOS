# Migration Order — omos-ui Pages → CloudTAK Fork

## Current omos-ui Pages (React 19)

These pages exist and work in the React codebase. Each gets ported to Vue 3 inside the CloudTAK fork.

## Priority 1: Prove the Pattern (Week 3)

| Page | Route | Effort | Why First |
|------|-------|--------|-----------|
| Terminal | /terminal | Easy | xterm.js is framework-agnostic. Drop-in. |
| Voice | /voice (floating panel) | Easy | Web Speech API is browser-native. |
| Wire | /fabric/wire | Easy | Just a filtered real-time log. |

These prove we can add pages to the fork and deploy them. Low risk, fast results.

## Priority 2: High Value (Week 4-5)

| Page | Route | Effort | Why |
|------|-------|--------|-----|
| Agents | /agents | Medium | Legacy AI is the centerpiece of OneMind OS |
| Intel | /intel | Medium | Overlaps existing CloudTAK — extend it |
| Fleet | /fleet | Medium | Robots + drones on the map — the wow factor |

These are what makes OneMind OS different from plain CloudTAK.

## Priority 3: Infrastructure (Week 5-6)

| Page | Route | Effort | Why |
|------|-------|--------|-----|
| Fabric/Bus | /fabric | Hard | NATS topology graph, 6 tabs, complex |
| TimeMachine | /history | Hard | ClickHouse SQL editor, charts |
| Services | /services | Medium | Tile launcher with health checks |
| Security | /fabric/security | Easy | Security event feed |
| Replay | /fabric/replay | Medium | NATS replay with time controls |

## Priority 4: New Features (Month 2+)

| Page | Route | Effort | Why |
|------|-------|--------|-----|
| Home | /home | Medium | Home Assistant deep integration |
| Agriculture | /agriculture | Medium | Field management, sensors |
| Community | /community | Hard | Multi-tenant, orgs, teams, invites |

## Translation Cheat Sheet (React → Vue 3)

```
React                      →  Vue 3
──────────────────────────────────────────────
import { useState }        →  import { ref }
import { useEffect }       →  import { onMounted, watch }
import { useMemo }         →  import { computed }

const [x, setX] = useState →  const x = ref(initialValue)
setX(newVal)               →  x.value = newVal
useEffect(() => {}, [])    →  onMounted(() => {})
useEffect(() => {}, [dep]) →  watch(dep, () => {})
useMemo(() => calc, [dep]) →  computed(() => calc)

<div onClick={fn}>         →  <div @click="fn">
<div className="x">       →  <div class="x">
{condition && <Comp/>}     →  <Comp v-if="condition"/>
{arr.map(i => <X key=/>)}  →  <X v-for="i in arr" :key="i.id"/>
<Comp prop={val}/>         →  <Comp :prop="val"/>
<input onChange={fn}/>     →  <input @input="fn"/>
```

## Shared Libraries (No Change Needed)

These work identically in Vue 3 — no porting required:
- xterm.js (terminal)
- D3.js (topology graphs)
- chart.js (charts)
- hls.js (video)
- MapLibre GL (maps)
- Web Speech API (voice)
- WebSocket API (NATS/real-time)

## omos-ui Retirement Plan

1. Fork is deployed at atoc.onemindos.dev with all pages
2. omos-ui pages verified working in fork
3. onemindos.dev redirects to atoc.onemindos.dev
4. omos-ui deployment scaled to 0
5. omos-ui repo archived (keep for reference)

