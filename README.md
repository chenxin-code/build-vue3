# Vue 3 Demo 项目

基于 Vue 3 + TypeScript + Vite 构建的 Demo 集合，展示各种前端技术实践和组件封装。

## 在线演示

访问 https://chenxin-code.github.io/build-vue3/

## 技术栈

- **框架**: Vue 3 (Composition API)
- **语言**: TypeScript
- **构建工具**: Vite
- **UI 组件库**: Element Plus
- **路由**: Vue Router 4
- **状态管理**: Pinia
- **图表**: ECharts
- **地图**: 百度地图
- **其他**: Avue, Lodash

## 功能特性

### Demo 展示 (`/demo`)

包含以下示例：

- **分组排序** - 数据分组和排序功能
- **打印/导出PDF** - 页面打印和 PDF 导出
- **Avue-Crud组件** - 基于 Avue 的快速 CRUD 开发
- **瀑布流** - 瀑布流布局实现
- **百度地图搜索/定位** - 地图集成与地理编码
- **大量图表渲染优化** - ECharts 大数据量渲染性能优化
- **el-select 加载更多** - 下拉框虚拟滚动与分页加载
- **太阳系** - Canvas 太阳系动画演示
- **同步/异步组件测试** - 组件的同步和异步加载方式演示

#### Demo 导航优化

- 按钮组水平居中，最大宽度 80%
- 超出时显示左右箭头，点击可平滑滚动
- 智能显示：仅当内容溢出时显示箭头
- 每次刷新页面随机打乱按钮顺序

### 白屏优化 (`/defer`)

Vue 3 的 `defer` 属性优化首屏渲染性能。

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

访问 http://localhost:888

### 构建生产版本

```bash
npm run build
```

`npm run build` 会先执行 `vue-tsc` 类型检查。项目存在存量类型错误时检查会中断构建，此时可单独执行以下命令跳过类型检查：

```bash
npx vite build
```

### 预览生产构建

```bash
npm run preview
```

### 类型检查

```bash
npx vue-tsc --noEmit
```

## 自动部署

本项目已配置 GitHub Actions 自动部署到 GitHub Pages：

- **触发条件**: 推送代码到 `master` 分支
- **部署流程**: 自动构建 → 发布到 `gh-pages` 分支 → GitHub Pages 读取
- **访问地址**: https://chenxin-code.github.io/build-vue3/

### 部署配置

- `.github/workflows/deploy.yml` — GitHub Actions 工作流配置，Node 20 环境，构建使用 `npx vite build`
- `vite.config.ts` — `base` 根据构建命令动态设置：
  - 开发环境: `/`
  - 生产构建: `/build-vue3/`

### 首次启用

GitHub Actions 推送 `gh-pages` 分支后，需在仓库 **Settings → Pages** 中将 Source 设置为 `gh-pages` 分支，部署才会生效。

## 开发建议

### IDE 配置

推荐使用 [VS Code](https://code.visualstudio.com/) + [Vue - Official](https://marketplace.visualstudio.com/items?itemName=Vue.volar) 扩展（原 Volar），并禁用 Vetur。

### 代码规范

- 使用 `<script setup>` 语法糖
- 优先使用 Composition API
- 组件命名使用 PascalCase
- 使用 TypeScript 进行类型检查

## 项目结构

```
src/
├── api/              # API 接口
├── assets/           # 静态资源
├── component/        # 公共组件
├── directive/        # 自定义指令
├── page/             # 页面
│   └── demo/         # Demo 页面
├── router/           # 路由配置
├── store/            # 状态管理
└── utils/            # 工具函数
```

## 相关链接

- [Vue 3 文档](https://vuejs.org/)
- [Vite 文档](https://vitejs.dev/)
- [Element Plus 文档](https://element-plus.org/)
- [TypeScript 文档](https://www.typescriptlang.org/)