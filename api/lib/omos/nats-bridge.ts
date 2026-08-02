/**
 * OneMind OS — NATS Bridge
 *
 * Connects the CloudTAK backend to the OneMind NATS bus.
 * This is the integration layer — every external system (intel feeds,
 * fleet, home automation, sensors) talks to NATS, and this bridge
 * presents it to the CloudTAK frontend via WebSocket.
 *
 * Architecture:
 *   Frontend → /api/ws/nats (WebSocket) → this bridge → NATS bus
 *
 * All files in api/lib/omos/ are OneMind additions (sandbox).
 * Upstream CloudTAK never touches this directory.
 */

import { connect, NatsConnection, Subscription } from "nats";
import type { Server } from "node:http";

export interface NATSBridgeConfig {
    url: string;
    user?: string;
    pass?: string;
    /** Subjects to subscribe to by default */
    subscribeSubjects: string[];
}

export class NATSBridge {
    private nc: NatsConnection | null = null;
    private subscriptions: Map<string, Subscription> = new Map();
    private wsClients: Set<WebSocket> = new Set();
    private config: NATSBridgeConfig;

    constructor(config?: Partial<NATSBridgeConfig>) {
        this.config = {
            url: process.env.NATS_URL || "nats://nats.nats.svc.cluster.local:4222",
            user: process.env.NATS_USER,
            pass: process.env.NATS_PASSWORD,
            subscribeSubjects: config?.subscribeSubjects || [
                "intel.>",
                "fleet.>",
                "home.>",
                "agents.>",
                "fabric.>",
                "tak.cot.>",
            ],
        };
    }

    /** Connect to the NATS bus */
    async connect(): Promise<void> {
        if (this.nc) return;

        const opts: Record<string, unknown> = {
            servers: this.config.url,
        };
        if (this.config.user) opts.user = this.config.user;
        if (this.config.pass) opts.pass = this.config.pass;

        try {
            this.nc = await connect(opts);
            console.error(`[omos/nats] Connected to ${this.nc.getServer()}`);

            // Subscribe to default subjects
            for (const subject of this.config.subscribeSubjects) {
                this.subscribe(subject);
            }
        } catch (err) {
            console.error(`[omos/nats] Connection failed: ${err}`);
            // Non-fatal — CloudTAK runs without NATS. Features degrade gracefully.
        }
    }

    /** Subscribe to a NATS subject and relay messages to all WS clients */
    subscribe(subject: string): void {
        if (!this.nc) return;

        const sub = this.nc.subscribe(subject);
        this.subscriptions.set(subject, sub);

        (async () => {
            for await (const msg of sub) {
                const payload = {
                    subject: msg.subject,
                    data: new TextDecoder().decode(msg.data),
                    timestamp: Date.now(),
                };
                this.broadcast(JSON.stringify(payload));
            }
        })().catch(console.error);
    }

    /** Add a WebSocket client to receive NATS events */
    addClient(ws: WebSocket): void {
        this.wsClients.add(ws);
        ws.onclose = () => this.wsClients.delete(ws);
    }

    /** Broadcast a message to all connected WebSocket clients */
    private broadcast(message: string): void {
        for (const ws of this.wsClients) {
            if (ws.readyState === ws.OPEN) {
                ws.send(message);
            }
        }
    }

    /** Publish a command to NATS */
    async publish(subject: string, data: string): Promise<void> {
        if (!this.nc) return;
        this.nc.publish(subject, new TextEncoder().encode(data));
    }

    /** Get connection status */
    getStatus(): { connected: boolean; server: string | null; subjects: string[] } {
        return {
            connected: this.nc !== null,
            server: this.nc?.getServer() || null,
            subjects: Array.from(this.subscriptions.keys()),
        };
    }

    /** Close everything cleanly */
    async close(): Promise<void> {
        for (const sub of this.subscriptions.values()) sub.unsubscribe();
        this.subscriptions.clear();
        if (this.nc) await this.nc.close();
        this.nc = null;
    }
}

// Singleton instance — used by the Express route handlers
let bridge: NATSBridge | null = null;

export function getBridge(): NATSBridge {
    if (!bridge) bridge = new NATSBridge();
    return bridge;
}
