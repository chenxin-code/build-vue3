import {createApp} from 'vue';
import App from './App.vue';
import router from './router';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import selectLoadMore from './directive/selectLoadMore.ts';
import Avue from '@smallwei/avue';
import '@smallwei/avue/lib/index.css';

const app = createApp(App);
app.use(router);
app.use(ElementPlus);
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component);
}
app.directive('selectLoadMore', selectLoadMore);
app.use(Avue);
app.mount('#app');
