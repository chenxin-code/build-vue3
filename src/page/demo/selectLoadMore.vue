<template>
  <el-select
      v-model="value"
      v-select-load-more:[popperClass]="selectLoadMore"
      clearable
      size="large"
      :popper-class="popperClass"
      style="display: block;margin-top: 25px;width: 600px">
    <el-option
        :value="item.value"
        v-for="(item,index) in selectOption"
        :key="index"/>
  </el-select>
</template>

<script lang="ts" setup>
import {ref} from 'vue';
import _ from 'lodash';

const value = ref(null);
const selectOption = ref([]);
const popperClass = 'class1';

const selectLoadMore = () => {
  setTimeout(() => {
    _.times(10, () => {
      selectOption.value.push({value: _.random(111, 999)});
    });
  }, 200);
};
selectLoadMore();
</script>