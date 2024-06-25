<template>
  <div style="height: 600px;display: flex;justify-content: center;align-items: center">
    <div>
      <el-autocomplete
          v-model="address"
          :fetch-suggestions="fetchSuggestions"
          @select="(item) => {address = item.value}"
          clearable
          style="margin-top: 20px;width: 500px"/>
      <el-icon @click="onAddress()" v-if="address">
        <LocationInformation/>
      </el-icon>
    </div>
  </div>
  <baiduMap ref="baiduMapRef" v-if="showBaiduMap"/>
</template>

<script lang="ts" setup>
import {ref, nextTick} from 'vue';
import request from './../../api/baiduMap';
import baiduMap from './../../component/baiduMap.vue';

const address = ref('');

const baiduMapSearch = (params) => {
  return request({
    url: '/su?cid=&type=0',
    method: 'get',
    params: params
  });
};

const fetchSuggestions = (queryString, callback) => {
  if (queryString) {
    baiduMapSearch({wd: queryString}).then(resp => {
      const respFormat = resp.s.map((item) => {
        let arr = item.split('$');
        return {value: arr[0] + arr[1] + arr[2] + arr[3]};
      });
      callback(respFormat);
    });
  }
};

const baiduMapRef = ref();

const showBaiduMap = ref(false);

const onAddress = () => {
  showBaiduMap.value = true;
  nextTick(() => {
    baiduMapRef.value.init(null, address.value);
  })
};
</script>

<style lang="less" scoped>

</style>