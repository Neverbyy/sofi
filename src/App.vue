<script setup lang="ts">
import Header from './components/Header.vue'
import Sidebar from './components/Sidebar.vue'
import SearchSettings from './components/SearchSettings.vue'
</script>

<template>
  <div class="app">
    <Header />
    <div class="main-content">
      <Sidebar />
      <SearchSettings />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/css/variables' as *;

.app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: $bg-gray;
}

.main-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}
</style>
