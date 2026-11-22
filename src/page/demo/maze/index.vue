<template>
  <div class="maze-page">
    <div class="button-group-wrapper">
      <el-button-group>
        <el-button
            :type="$route.path === '/demo/maze/' + item.path ? 'primary' : ''"
            @click="$router.push({path: '/demo/maze/' + item.path})"
            :disabled="$route.path === '/demo/maze/' + item.path"
            size="small"
            v-for="(item, index) in mazeIndex"
            :key="index">
          {{ item.title }}
        </el-button>
      </el-button-group>
    </div>

    <!-- 29 格 × 30px 有 870px 宽，窄屏时让地图自己横向滚动，别把整页撑坏 -->
    <div class="map-scroll">
      <router-view/>
    </div>
  </div>
</template>

<script setup>
const mazeIndex = [
  {title: '深度优先、递归求解', path: '1'},
  {title: '非递归、栈、深度优先', path: '2'},
];
</script>

<style lang="less" scoped>
.button-group-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 15px;
  overflow-x: auto;

  :deep(.el-button-group) {
    flex-wrap: nowrap;
    display: inline-flex;
  }
}

.map-scroll {
  overflow-x: auto;
  padding-bottom: 10px;
}

/*
 * 地图和格子的样式写在父组件，是因为两种解法共用同一套底色。
 * 子组件只有根元素会带上这里的 scoped 属性，内部的格子必须用 :deep() 才命中。
 */
:deep(#map) {
  border: 2px solid #6a6f77;
  margin: 0 auto;
}

:deep(.line) {
  height: 30px;
  width: 100%;
}

:deep(.wall),
:deep(.road),
:deep(.path),
:deep(.visited) {
  width: 30px;
  height: 30px;
  display: inline-block;
}

:deep(.wall) {
  background: #45494c;
}

:deep(.road) {
  background: #ffffff;
}

:deep(.path) {
  background: #f57a7a;
}

:deep(.visited) {
  background: #999999;
}
</style>
