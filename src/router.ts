import {createRouter, createWebHistory, createWebHashHistory, createMemoryHistory} from 'vue-router';

const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        { path: '/defer', component: () => import('./page/defer.vue') },
    ]
});

export default router;
