import { createApp } from 'vue'
import * as VueRouter from 'vue-router'
import { createPinia } from 'pinia'

import ServicesPage from './ServicesPage.vue'

import '@tabler/core/dist/css/tabler.min.css';

const router = VueRouter.createRouter({
    history: VueRouter.createWebHistory(),
    routes: [
        {
            path: '/services',
            name: 'services',
            component: ServicesPage,
        }
    ]
});

const app = createApp(ServicesPage);
const pinia = createPinia();
app.use(router);
app.use(pinia);
app.mount('#app');
