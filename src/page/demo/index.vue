<template>
  <div>
    <el-divider>DEMO</el-divider>
    <el-button-group>
      <el-button
          :type="$route.path === '/demo/' + item.path ? 'primary' : ''"
          @click="$router.push({ path: '/demo/' + item.path })"
          :disabled="$route.path === '/demo/' + item.path"
          size="large"
          v-for="(item,index) in demoIndex"
          :key="index">
        {{ item.title }}
      </el-button>
    </el-button-group>
    <router-view/>
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue';

const demoIndex = ref([
  {title: '分组排序', path: 'group-order'},
  {title: '打印/导出PDF', path: 'print-exportPDF'},
  {title: 'Avue-Crud组件', path: 'Avue-Crud'},
  {title: '瀑布流', path: 'waterFall'},
  {title: '百度地图搜索/定位', path: 'baiduMap-search-locate'},
  {title: '大量图表渲染优化', path: 'massChartsRenderOptimize'},
  {title: 'el-select 加载更多', path: 'selectLoadMore'},
]);
</script>

<style lang="less" scoped>
</style>
