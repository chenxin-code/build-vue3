<template>
  <el-autocomplete
      v-model="address"
      :fetch-suggestions="fetchSuggestions"
      @select="(item) => {address = item.value}"
      clearable
      style="margin-top: 20px;width: 500px;display: block"/>
</template>

<script lang="ts" setup>
import {ref} from 'vue';
import request from './../../api/baiduMap';

const address = ref('');

const baiduMap = (params) => {
  return request({
    url: '/su?cid=&type=0',
    method: 'get',
    params: params
  });
};

const fetchSuggestions = (queryString, callback) => {
  if (queryString) {
    baiduMap({wd: queryString}).then(resp => {
      const baiduMap = resp.s.map((item) => {
        let arr = item.split('$');
        return {value: arr[0] + arr[1] + arr[2] + arr[3]};
      });
      callback(baiduMap);
    });
  }
};
</script>

<style lang="less" scoped>

</style>