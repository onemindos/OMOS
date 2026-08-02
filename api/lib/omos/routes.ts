/**
 * OneMind OS — Express route registration for OMOS features
 *
 * All new backend routes live here (sandbox). We never modify
 * upstream route files. This module is imported once from the
 * main Express app with a single line.
 *
 * Routes:
 *   GET  /api/omos/status     — NATS bridge status
 *   WS   /api/ws/nats         — WebSocket relay for NATS events
 *   POST /api/omos/publish    — Publish a message to NATS
 */

import { Router, type Request, type Response } from "express";
import { WebSocketServer, type WebSocket } from "ws";
import type { Server } from "node:http";
import { getBridge } from "./nats-bridge.js";

export const omosRouter = Router();

/**
 * GET /api/omos/status
 * Returns the NATS bridge connection status and subscribed subjects.
 */
omosRouter.get("/omos/status", (_req: Request, res: Response) => {
    const bridge = getBridge();
    res.json(bridge.getStatus());
});

/**
 * POST /api/omos/publish
 * Publish a message to a NATS subject.
 * Body: { subject: string, data: string }
 */
omosRouter.post("/omos/publish", async (req: Request, res: Response) => {
    const { subject, data } = req.body;
    if (!subject || !data) {
        res.status(400).json({ error: "subject and data required" });
        return;
    }
    const bridge = getBridge();
    await bridge.publish(subject, data);
    res.json({ ok: true, subject });
});

/**
 * Attach the NATS WebSocket endpoint to an HTTP server.
 * Called during app startup, after the server is created.
 *
 * Endpoint: /api/ws/nats
 */
export function attachNATSWebSocket(server: Server): void {
    const wss = new WebSocketServer({ noServer: true });
    const bridge = getBridge();

    server.on("upgrade", (req, socket, head) => {
        const url = new URL(req.url || "", `http://${req.headers.host}`);
        if (url.pathname === "/api/ws/nats") {
            wss.handleUpgrade(req, socket, head, (ws: WebSocket) => {
                bridge.addClient(ws);
                ws.send(JSON.stringify({
                    type: "connected",
                    status: bridge.getStatus(),
                }));
            });
        }
    });

    // Connect to NATS on startup (non-blocking, degrades gracefully)
    bridge.connect().catch((err) => {
        console.error(`[omos/nats] Initial connection failed: ${err}`);
    });
}
