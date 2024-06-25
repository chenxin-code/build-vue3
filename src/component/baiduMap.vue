<template>
  <el-dialog v-model="showDialog" :title="addressDetail" :destroy-on-close="true" width="60%" append-to-body draggable>
    经纬度： [{{ lnglat }}]
    <div id="container" style="width: 100%; height: 400px; background: #fafafa"/>
  </el-dialog>
</template>

<script lang="ts" setup>
import {ref, nextTick, defineExpose} from 'vue';
import {ElMessage} from 'element-plus';

const showDialog = ref(false);
const addressDetail = ref('');
const lng = ref('');
const lat = ref('');
const lnglat = ref('');
const init = (coord, address) => {
  showDialog.value = true;
  addressDetail.value = address;
  coord = coord ? coord : '116.404,39.915';
  lnglat.value = coord;
  if (coord) {
    let arr = coord.split(',');
    lng.value = arr[0];
    lat.value = arr[1];
    nextTick(() => {
      const map = new BMapGL.Map('container');
      map.enableScrollWheelZoom(true); //滚轮缩放
      map.addControl(new BMapGL.CityListControl());  //添加城市列表控件
      map.addControl(new BMapGL.ZoomControl());  //添加缩放控件
      //创建地址解析器实例
      const myGeo = new BMapGL.Geocoder();
      //将地址解析结果显示在地图上，并调整地图视野
      myGeo.getPoint(address, (point) => {
        console.log('point', point);
        if (point) {
          map.centerAndZoom(point, 16);
          //标注
          map.addOverlay(new BMapGL.Marker(point, {title: address}));
          lng.value = point.lng;
          lat.value = point.lat;
          lnglat.value = lng.value+','+ lat.value;
        } else {
          ElMessage.error('您选择的地址没有解析到结果！');
        }
      }, '北京市');
    });
  }
};

defineExpose({
  init,
});
</script>

<style lang="less" scoped>

</style>
