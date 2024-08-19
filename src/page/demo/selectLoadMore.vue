<template>
  <el-select
      v-model="select1Value"
      v-select-load-more:[popperClass1]="select1LoadMore"
      clearable
      size="large"
      :popper-class="popperClass1"
      style="display: block;margin-top: 25px;width: 600px">
    <el-option
        :value="item"
        v-for="(item,index) in select1Option"
        :key="index"/>
  </el-select>
  <el-select
      v-model="select2Value"
      v-select-load-more:[popperClass2]="select2LoadMore"
      clearable
      size="large"
      :popper-class="popperClass2"
      style="display: block;margin-top: 25px;width: 600px">
    <el-option
        :value="item"
        v-for="(item,index) in select2Option"
        :key="index"/>
  </el-select>
</template>

<script lang="ts" setup>
import {ref} from 'vue';
import _ from 'lodash';

const select1Value = ref(null);
const select2Value = ref(null);
const select1Option = ref([]);
const select2Option = ref([]);
const popperClass1 = 'popperClass1';// 区分不同的 el-select
const popperClass2 = 'popperClass2';// 区分不同的 el-select

const select1LoadMore = () => {
  setTimeout(() => {
    _.times(10, () => {
      select1Option.value.push(_.random(111, 999));
    });
  }, 200);
};
const select2LoadMore = () => {
  setTimeout(() => {
    _.times(10, () => {
      select2Option.value.push(_.random(1111, 9999));
    });
  }, 200);
};
select1LoadMore();
select2LoadMore();
</script>