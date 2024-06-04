<template>
  <div v-for="n in 999" :key="n">
    <bigContent v-if="useDefer(n)"/>
  </div>
</template>

<script lang="ts" setup>
import bigContent from './../component/big-content.vue';
import {defer} from './../toolFunc.ts';

//白屏优化
const useDefer = ((n) => defer(n))();
</script>

<style lang="less" scoped>

</style>