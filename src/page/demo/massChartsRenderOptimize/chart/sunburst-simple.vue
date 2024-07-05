<template>
  <div :id="'main' + props.id"/>
</template>

<script lang="ts" setup>
import {defineProps, onMounted} from 'vue';

import * as echarts from 'echarts';

const props = defineProps(['id']);

onMounted(() => {
  var chartDom = document.getElementById('main' + props.id);
  var myChart = echarts.init(chartDom);
  var option;

  var data = [
    {
      name: 'Grandpa',
      children: [
        {
          name: 'Uncle Leo',
          value: 15,
          children: [
            {
              name: 'Cousin Jack',
              value: 2
            },
            {
              name: 'Cousin Mary',
              value: 5,
              children: [
                {
                  name: 'Jackson',
                  value: 2
                }
              ]
            },
            {
              name: 'Cousin Ben',
              value: 4
            }
          ]
        },
        {
          name: 'Father',
          value: 10,
          children: [
            {
              name: 'Me',
              value: 5
            },
            {
              name: 'Brother Peter',
              value: 1
            }
          ]
        }
      ]
    },
    {
      name: 'Nancy',
      children: [
        {
          name: 'Uncle Nike',
          children: [
            {
              name: 'Cousin Betty',
              value: 1
            },
            {
              name: 'Cousin Jenny',
              value: 2
            }
          ]
        }
      ]
    }
  ];
  option = {
    series: {
      type: 'sunburst',
      // emphasis: {
      //     focus: 'ancestor'
      // },
      data: data,
      radius: [0, '90%'],
      label: {
        rotate: 'radial'
      }
    }
  };

  option && myChart.setOption(option);
});
</script>