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
    tooltip: {
      formatter: '{a} <br/>{b} : {c}%'
    },
    series: [
      {
        name: 'Pressure',
        type: 'gauge',
        detail: {
          formatter: '{value}'
        },
        data: [
          {
            value: _.random(0, 100),
            name: 'SCORE'
          }
        ]
      }
    ]
  });
});
</script>