import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './index.css'

const app = createApp(App) // 创建实例

app.use(router)
app.mount('#app')
