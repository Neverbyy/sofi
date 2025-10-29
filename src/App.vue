<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import Header from './components/Header.vue'
import Sidebar from './components/Sidebar.vue'
import SearchSettings from './components/SearchSettings.vue'
import LoginModal from './components/LoginModal.vue'
import { vacancyApiService } from './services/vacancyApi'

const isMobileMenuOpen = ref(false)
const showLogin = ref(false)

const handleMobileMenuToggle = (isOpen: boolean) => {
  isMobileMenuOpen.value = isOpen
}

const handleCloseMobileMenu = () => {
  isMobileMenuOpen.value = false
}

const handleLoginSuccess = () => {
  showLogin.value = false
  // Перезагружаем страницу для применения новой авторизации
  window.location.reload()
}

// Проверяем авторизацию при загрузке
onMounted(async () => {
  try {
    // Пытаемся загрузить данные - если не авторизован, будет ошибка
    await vacancyApiService.getPositions()
  } catch (error: any) {
    // Если ошибка связана с отсутствием credentials, показываем форму
    if (error.message?.includes('Credentials not found') || error.message?.includes('401') || error.message?.includes('403')) {
      showLogin.value = true
    }
  }
})

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
    <LoginModal v-if="showLogin" @success="handleLoginSuccess" />
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
