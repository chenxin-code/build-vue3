<template>
  <div style="display: flex">
    <div style="flex: 1;margin: 0 10px">
      <el-divider>同步组件</el-divider>
      <el-button type="primary" @click="showBigContentSync = !showBigContentSync">change</el-button>
      <bigContentSync v-if="showBigContentSync"/>
    </div>
    <div style="flex: 1;margin: 0 10px">
      <el-divider>异步组件</el-divider>
      <el-button type="primary" @click="showBigContentAsync = !showBigContentAsync">change</el-button>
      <bigContentAsync v-if="showBigContentAsync"/>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {ref, defineAsyncComponent} from 'vue';
import bigContentSync from './../component/big-content-1.vue'; // 同步组件
const bigContentAsync = defineAsyncComponent(() => import('./../component/big-content-2.vue'));// 异步组件

const showBigContentSync = ref(false);
const showBigContentAsync = ref(false);
</script>

<style lang="less" scoped>

</style>
