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
      data: ['2017-10-24', '2017-10-25', '2017-10-26', '2017-10-27']
    },
    yAxis: {},
    series: [
      {
        type: 'candlestick',
        data: [
          [_.random(10, 50), _.random(10, 50), _.random(10, 50), _.random(10, 50)],
          [_.random(10, 50), _.random(10, 50), _.random(10, 50), _.random(10, 50)],
          [_.random(10, 50), _.random(10, 50), _.random(10, 50), _.random(10, 50)],
          [_.random(10, 50), _.random(10, 50), _.random(10, 50), _.random(10, 50)]
        ]
      }
    ]
  });
});
</script>