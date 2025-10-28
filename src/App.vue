<script setup lang="ts">
import { ref, watch } from 'vue'
import Header from './components/Header.vue'
import Sidebar from './components/Sidebar.vue'
import SearchSettings from './components/SearchSettings.vue'

const isMobileMenuOpen = ref(false)

const handleMobileMenuToggle = (isOpen: boolean) => {
  isMobileMenuOpen.value = isOpen
}

const handleCloseMobileMenu = () => {
  isMobileMenuOpen.value = false
}

// Блокируем скролл страницы когда открыто мобильное меню
watch(isMobileMenuOpen, (isOpen) => {
  if (isOpen) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})
</script>

<template>
  <div class="app">
    <Header @mobile-menu-toggle="handleMobileMenuToggle" />
    <div class="main-content">
      <Sidebar 
        :is-mobile-menu-open="isMobileMenuOpen" 
        @close-mobile-menu="handleCloseMobileMenu" 
      />
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

  // Mobile styles - full width when sidebar is hidden
  @media (max-width: 560px) {
    display: block;
    overflow: visible;
  }
}
</style>
