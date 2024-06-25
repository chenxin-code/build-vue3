import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 888,// 项目运行的端口号
    proxy: {
      '/baiduMap': {
        target: 'https://map.baidu.com',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/baiduMap/, ''),
      },
    },
  },
})
