# OneMind OS Platform — Master Plan

## The Decision
**Fork CloudTAK. Keep Vue 3. Add NATS as backend transport. Port omos-ui pages as native CloudTAK routes.**

One URL. One login. One codebase. The map is the OS.

---

## What We Have Right Now (Working)

| Component | Status | Image |
|-----------|--------|-------|
| CloudTAK API | ✅ Running |  |
| CloudTAK Events | ✅ Running | Same image, events mode |
| CloudTAK Media (MediaMTX) | ✅ Running |  |
| CloudTAK Tiles (PMTiles) | ✅ Running | Same image, tiles mode |
| MinIO (S3-compatible) | ✅ Running |  |
| PostGIS | ✅ Running |  |
| Plugin: onemind-ai | ✅ Compiled in | Legacy AI chat panel |
| Build Pipeline | ✅ GitHub Actions | Pulls upstream → injects plugins → builds → GHCR |
| ArgoCD | ✅ Deploying | GitOps from omos-infra |
| TAK Server | ✅ All pods healthy | 5.7-RELEASE-43-HEAD |
| omos-ui | ✅ Running separately |  (to be absorbed) |

## The Architecture



See: architecture/ARCHITECTURE.md for full diagram

## Repos

| Repo | Purpose |
|------|---------|
|  | GitOps, manifests, plugins, CI |
|  | EXISTING React UI (source for page ports) |
|  | Upstream (we pull latest release tag) |
|  | OUR FORK (to be created — see migration/FORK-PLAN.md) |

## Build Pipeline (Current — Plugin Injection)



## Build Pipeline (Target — Full Fork)



## Migration Order

See migration/MIGRATION-ORDER.md for the full timeline.

## Key URLs

| Service | URL |
|---------|-----|
| OneMind OS (CloudTAK) | https://atoc.onemindos.dev |
| omos-ui (to be absorbed) | https://onemindos.dev |
| TAK Server WebTAK | :8446 (admin only) |
| 3D Globe | tak3d.tail717ba0.ts.net |
| Grafana | grafana.tail717ba0.ts.net |

