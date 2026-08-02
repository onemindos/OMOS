# Deployment Architecture

## Current Flow (Working)

```
omos-infra (GitHub) → push to main
    ↓
GitHub Actions: build-cloudtak.yml
    ↓
Pull upstream CloudTAK latest release
    ↓  
Copy plugins in
    ↓
Docker build → ghcr.io/onemindos/cloudtak-api:latest
    ↓
ArgoCD detects new image → deploys to DOKS
```

## Target Flow (After Fork)

```
onemindos/cloudtak (GitHub) → push to onemind/main
    ↓
GitHub Actions: build.yml (in the fork repo itself)
    ↓
Docker build from our fork directly (no upstream pull needed)
    ↓
ghcr.io/onemindos/cloudtak-api:latest
    ↓
ArgoCD detects new image → deploys to DOKS
```

## K8s Resources (CloudTAK namespace)

| Deployment | Purpose | Image |
|-----------|---------|-------|
| cloudtak-api | Main API + frontend | ghcr.io/onemindos/cloudtak-api:latest |
| cloudtak-events | Background event processor | Same image, different mode |
| cloudtak-tiles | PMTiles tile server | Same image, tiles task |
| cloudtak-media | MediaMTX (video) | ghcr.io/dfpc-coe/media-infra:v9.9.0 |
| cloudtak-minio | Object storage (S3) | minio/minio |
| cloudtak-postgis | PostgreSQL + PostGIS | postgis/postgis:17-3.4-alpine |

## Environment Variables (Key)

```yaml
CLOUDTAK_Mode: docker-compose
CLOUDTAK_Config_login__name: OneMind OS
CLOUDTAK_Config_server__name: OneMind OS
CLOUDTAK_Config_media_url: http://cloudtak-media:9997
API_URL: https://atoc.onemindos.dev
PMTILES_URL: https://tiles.atoc.onemindos.dev
POSTGRES: (from secret)
SigningSecret: (from secret)
AWS_S3_Endpoint: http://cloudtak-minio:9000
# NEW after fork:
NATS_URL: nats://nats.nats.svc.cluster.local:4222
NATS_USER: (from secret)
NATS_PASSWORD: (from secret)
```

## URLs

| URL | Routes To | Purpose |
|-----|-----------|---------|
| atoc.onemindos.dev | cloudtak-api:5000 | Main UI (Cloudflare tunnel) |
| tiles.atoc.onemindos.dev | cloudtak-tiles:5002 | Map tiles |
| onemindos.dev | omos-ui:80 | DEPRECATED after migration |

## Secrets (1Password → ESO → K8s)

All in 1Password vault "00-24 SO":
- `SIGNING_SECRET` — JWT signing
- `POSTGRES` — DB connection string
- `AWS_S3_AccessKeyId` — MinIO access key
- `AWS_S3_SecretAccessKey` — MinIO secret key
- `NATS_USER` — NATS auth (to be added)
- `NATS_PASSWORD` — NATS auth (to be added)

