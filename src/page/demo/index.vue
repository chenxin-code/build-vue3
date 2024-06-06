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
]);
</script>

<style lang="less" scoped>
</style>
