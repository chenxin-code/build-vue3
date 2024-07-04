<template>
  <div class="container">
    <div v-for="n in 999" :key="n">
      <chart1 :index="n" v-if="useDefer(n)" style="height: 100%"/>
    </div>
  </div>
</template>

<script lang="ts" setup>
import chart1 from './chart/1.vue';
import {defer} from './../../../toolFunc.ts';

//白屏优化
const useDefer = ((n) => defer(n))();
</script>

<style lang="less" scoped>
.container {
  display: grid;
  grid-template-columns: 11vw 11vw 11vw 32vw 11vw 11vw 11vw;
}
</style>