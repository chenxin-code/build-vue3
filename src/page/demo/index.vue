<template>
  <div>
    <h2>demo秀</h2>
    <button @click="$router.push({ path: '/demo/ssq' });">模拟双色球</button>
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  data() {
    return {};
  },
  methods: {},
  mounted() {
  },
}
</script>

<style scoped>
</style>