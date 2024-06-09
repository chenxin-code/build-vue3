<template>
  <div v-for="n in 999" :key="n">
    <bigContent1 v-if="useDefer(n)"/>
  </div>
</template>

<script lang="ts" setup>
import bigContent1 from './../component/big-content-1.vue';
import {defer} from './../toolFunc.ts';

//白屏优化
const useDefer = ((n) => defer(n))();
</script>

<style lang="less" scoped>

</style>
