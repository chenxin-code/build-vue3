import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/build-vue3/' : '/', // 开发环境 '/'，生产部署 '/build-vue3/'
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
}))
