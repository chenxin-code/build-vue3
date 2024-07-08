<template>
  <div :id="props.id"/>
</template>

<script lang="ts" setup>
import {defineProps, onMounted} from 'vue';
import _ from 'lodash';
import * as echarts from 'echarts';

const props = defineProps(['id']);

onMounted(() => {
  echarts.init(document.getElementById(props.id)).setOption({
    xAxis: {
      type: 'category',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        data: [_.random(10, 30), _.random(10, 30), _.random(10, 30), _.random(10, 30), _.random(10, 30), _.random(10, 30), _.random(10, 30)],
        type: 'bar'
      }
    ]
  });
});
</script>