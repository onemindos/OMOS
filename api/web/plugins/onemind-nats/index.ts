import { h } from 'vue';
import type { App } from 'vue';
import type { PluginAPI, PluginInstance } from '@tak-ps/cloudtak';
import MenuTemplate from '../onemind-ai/lib/MenuTemplate.vue';
import NatsPanel from './lib/NatsPanel.vue';
import NatsStatusBar from './lib/NatsStatusBar.vue';
import IconNats from './lib/IconNats.vue';

const ROUTE_NAME = 'home-menu-onemind-nats';
const MENU_KEY = 'onemind-nats';
const BOTTOM_BAR_KEY = 'onemind-nats-status';

export default class OneMindNats implements PluginInstance {
    api: PluginAPI;

    constructor(api: PluginAPI) {
        this.api = api;
    }

    static async install(app: App, api: PluginAPI): Promise<PluginInstance> {
        return new OneMindNats(api);
    }

    async enable(): Promise<void> {
        this.api.routes.add(
            {
                path: 'onemind-nats',
                name: ROUTE_NAME,
                component: {
                    render: () => h(MenuTemplate, { name: 'NATS Bus' }, {
                        default: () => h(NatsPanel)
                    })
                },
            },
            'home-menu'
        );

        this.api.menu.add({
            key: MENU_KEY,
            label: 'NATS Bus',
            route: ROUTE_NAME,
            tooltip: 'Real-time NATS bus status',
            description: 'Monitor the OneMind nervous system',
            icon: IconNats,
        });

        this.api.bottomBar.add({
            key: BOTTOM_BAR_KEY,
            component: NatsStatusBar,
        });
    }

    async disable(): Promise<void> {
        this.api.bottomBar.remove(BOTTOM_BAR_KEY);
        this.api.menu.remove(MENU_KEY);
        this.api.router.removeRoute(ROUTE_NAME);
    }
}
