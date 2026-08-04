import { createApp } from 'vue'
import * as VueRouter from 'vue-router'
import { createPinia } from 'pinia'

import App from '../../App.vue'

const router = VueRouter.createRouter({
    history: VueRouter.createWebHistory(),
    routes: [
        {
            path: '/services',
            name: 'services',
            component: () => import('./ServicesPage.vue'),
        }
    ]
});

const app = createApp(App);
const pinia = createPinia();
app.use(router);
app.use(pinia);
app.mount('#app');
