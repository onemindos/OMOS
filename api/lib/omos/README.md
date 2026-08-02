# OneMind OS — Sandbox

This directory contains OneMind OS backend additions to the CloudTAK fork.

**All files here are sandbox code** — upstream CloudTAK never touches this directory.
New features are added here, not by editing upstream route files.

## Files

| File | Purpose |
|------|---------|
| `nats-bridge.ts` | NATS client singleton — connects to the bus, relays events to WebSocket clients |
| `routes.ts` | Express routes: `/api/omos/status`, `/api/omos/publish`, WS `/api/ws/nats` |

## How it connects to CloudTAK

One line added to the main Express app startup (documented in ONEMIND.md):

```typescript
import { omosRouter, attachNATSWebSocket } from './lib/omos/routes.js'
app.use('/api', omosRouter)
attachNATSWebSocket(server)
```

That's the only upstream file we touch. Everything else lives here.
