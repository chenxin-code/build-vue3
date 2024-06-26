<template>
  <el-dialog
      v-model="showDialog"
      :title="dialogTitle"
      width="60%"
      append-to-body
      draggable
      destroy-on-close>
    经纬度：[{{ lng + ',' + lat }}]
    <div id="container" style="height: 400px"/>
  </el-dialog>
</template>

<script lang="ts" setup>
import {ref, nextTick, defineExpose} from 'vue';
import {ElMessage} from 'element-plus';

const showDialog = ref(false);
const dialogTitle = ref('');
const lng = ref('');
const lat = ref('');
const initMap = (address) => {
  showDialog.value = true;
  dialogTitle.value = address;
  nextTick(() => {
    const map = new BMapGL.Map('container');
    map.enableScrollWheelZoom(true); //滚轮缩放
    map.addControl(new BMapGL.CityListControl());  //添加城市列表控件
    map.addControl(new BMapGL.ZoomControl());  //添加缩放控件
    //创建地址解析器实例
    const geocoder = new BMapGL.Geocoder();
    //将地址解析结果显示在地图上，并调整地图视野
    geocoder.getPoint(address, (point) => {
      console.log('point', point);
      if (point) {
        lng.value = point.lng;
        lat.value = point.lat;
        map.centerAndZoom(point, 16);
        //标注
        map.addOverlay(new BMapGL.Marker(point, {title: address}));
      } else {
        ElMessage.error('您选择的地址没有解析到结果！');
      }
    }, '北京市');
  });
};

defineExpose({initMap});
</script>

<style lang="less" scoped>

</style>
