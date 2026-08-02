# Plugin System Reference

## How CloudTAK Plugins Work

Plugins are TypeScript/Vue modules dropped into `api/web/plugins/<name>/`.
Vite discovers them at build time via glob import in `main.ts`.
They compile into the bundle — no runtime loading.

## Plugin API (available to every plugin)

```typescript
interface PluginAPI {
    // Add routes to the Vue Router
    routes: {
        add(route: RouteConfig, parent?: string): void;
    };

    // Add items to the left nav menu
    menu: {
        add(item: MenuItem): void;
        remove(key: string): void;
    };

    // Add floating panels
    float: {
        add(component: Component): void;
        remove(key: string): void;
    };

    // Add bottom bar widgets
    bottomBar: {
        add(item: { key: string; component: Component }): void;
        remove(key: string): void;
    };

    // Access Vue Router directly
    router: Router;

    // Access the MapLibre map instance
    map: MaplibreMap;

    // Access Pinia stores
    stores: {
        app: AppStore;
        map: MapStore;
        device: DeviceStore;
    };
}
```

## Our Existing Plugin: onemind-ai

Located: `api/web/plugins/onemind-ai/`

```
onemind-ai/
├── index.ts              ← Plugin entry (install, enable, disable)
├── package.json
└── lib/
    ├── AIPanel.vue       ← Chat interface (floating right panel)
    ├── AIBottomBar.vue   ← Status indicator (bottom bar)
    ├── IconAI.vue        ← Custom icon
    └── MenuTemplate.vue  ← Menu wrapper
```

## When to Use Plugins vs Direct Pages

| Use Plugin | Use Direct Page |
|-----------|-----------------|
| Optional/toggleable feature | Core OS feature |
| Third-party would build it | We build it |
| Needs to be distributable | Part of our fork |
| Small footprint (panel, widget) | Full-page route with complex state |

For OneMind OS: most new features are DIRECT PAGES in the fork.
The plugin system is for things that should be optional/configurable.

## Future Plugin Ideas (for community/marketplace)

- Weather overlay plugin
- ADS-B receiver plugin
- Garden sensor plugin
- Mesh radio plugin (Meshtastic/goTenna)
- Biometric plugin (Samsung Health)
- AI model selector plugin

