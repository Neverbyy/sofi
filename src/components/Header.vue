<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import NotificationsDropdown from './NotificationsDropdown.vue'

interface Emits {
  (e: 'mobile-menu-toggle', isOpen: boolean): void
}

const emit = defineEmits<Emits>()

const isDropdownOpen = ref(false)
const isNotificationsOpen = ref(false)
const isMobileMenuOpen = ref(false)

const handleDropdownToggle = () => {
  isDropdownOpen.value = !isDropdownOpen.value
  // Закрываем уведомления при открытии пользовательского меню
  if (isDropdownOpen.value) {
    isNotificationsOpen.value = false
  }
}

const handleNotificationsToggle = () => {
  isNotificationsOpen.value = !isNotificationsOpen.value
  // Закрываем пользовательское меню при открытии уведомлений
  if (isNotificationsOpen.value) {
    isDropdownOpen.value = false
  }
}

const handleCloseNotifications = () => {
  isNotificationsOpen.value = false
}

const handleMobileMenuToggle = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
  // Закрываем другие меню при открытии мобильного меню
  if (isMobileMenuOpen.value) {
    isDropdownOpen.value = false
    isNotificationsOpen.value = false
  }
  // Эмитим событие для родительского компонента
  emit('mobile-menu-toggle', isMobileMenuOpen.value)
}


const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement
  const userInfo = target.closest('.user-info')
  const dropdownMenu = target.closest('.dropdown-menu')
  const notifications = target.closest('.notifications')
  const notificationsDropdown = target.closest('.notifications-dropdown')
  const mobileMenu = target.closest('.mobile-menu')
  const burgerMenu = target.closest('.burger-menu')
  
  if (!userInfo && !dropdownMenu) {
    isDropdownOpen.value = false
  }
  
  if (!notifications && !notificationsDropdown) {
    isNotificationsOpen.value = false
  }

  if (!mobileMenu && !burgerMenu) {
    isMobileMenuOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <header class="header">
    <div class="header-left">
      <div class="logo">
        <img src="/src/assets/img/logo.png" alt="Софи" class="logo-image" />
      </div>
    </div>
    
    <div class="header-right">
      <div class="notifications" @click="handleNotificationsToggle">
        <img src="/src/assets/img/notification.png" alt="Notifications" class="notification-icon" />
        <div class="notification-dot"></div>
      </div>
      
      <!-- Desktop user info -->
      <div class="user-info desktop-only" @click="handleDropdownToggle">
        <div class="user-icon">
          <img src="/src/assets/img/user.png" alt="User" class="user-avatar" />
        </div>
        <div class="user-details">
          <div class="user-name">Андрей Луцкевич</div>
          <div class="user-account">Аккаунт НН.ru</div>
        </div>
        <img 
          src="/src/assets/img/arrow.png" 
          alt="Dropdown" 
          class="dropdown-icon"
          :class="{ rotated: isDropdownOpen }"
        />
      </div>

      <!-- Mobile burger menu -->
      <div class="burger-menu mobile-only" @click="handleMobileMenuToggle" v-if="!isMobileMenuOpen">
        <svg width="16" height="11" viewBox="0 0 16 11" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14.5625 2.0625H1.4375C0.90625 2.0625 0.5 1.65625 0.5 1.125C0.5 0.59375 0.90625 0.1875 1.4375 0.1875H14.5625C15.0938 0.1875 15.5 0.59375 15.5 1.125C15.5 1.65625 15.0938 2.0625 14.5625 2.0625ZM14.5625 6.4375H1.4375C0.90625 6.4375 0.5 6.03125 0.5 5.5C0.5 4.96875 0.90625 4.5625 1.4375 4.5625H14.5625C15.0938 4.5625 15.5 4.96875 15.5 5.5C15.5 6.03125 15.0938 6.4375 14.5625 6.4375ZM14.5625 10.8125H1.4375C0.90625 10.8125 0.5 10.4062 0.5 9.875C0.5 9.34375 0.90625 8.9375 1.4375 8.9375H14.5625C15.0938 8.9375 15.5 9.34375 15.5 9.875C15.5 10.4062 15.0938 10.8125 14.5625 10.8125Z" fill="#131313"></path>
        </svg>
      </div>

      <!-- Mobile close button -->
      <div class="mobile-close-btn mobile-only" @click="handleMobileMenuToggle" v-if="isMobileMenuOpen">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>

      <!-- Notifications dropdown -->
      <NotificationsDropdown 
        :is-open="isNotificationsOpen"
        @close="handleCloseNotifications"
      />
      <div class="dropdown-menu" :class="{ open: isDropdownOpen }">
        <div class="dropdown-item">
          <img src="/src/assets/img/user.png" alt="Profile" class="dropdown-icon" />
          <span>Мой профиль</span>
        </div>
        <div class="dropdown-item">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" data-v-f151468c=""><path fill-rule="evenodd" clip-rule="evenodd" d="M8 16C12.4184 16 16 12.4184 16 8C16 3.5816 12.4184 0 8 0C3.5816 0 0 3.5816 0 8C0 12.4184 3.5816 16 8 16Z" fill="#DF1B12" data-v-f151468c=""></path><path fill-rule="evenodd" clip-rule="evenodd" d="M4.55087 4.38965V7.11125C4.96527 6.61765 5.46127 6.36885 6.03727 6.36885C6.33407 6.36885 6.59967 6.42565 6.83807 6.53765C7.07727 6.64965 7.25566 6.79285 7.37646 6.96645C7.49806 7.14245 7.57967 7.33445 7.62367 7.54645C7.66767 7.75765 7.69007 8.08565 7.69007 8.53125V11.4408H6.40287V8.82005C6.40287 8.30005 6.37967 7.97045 6.33087 7.83045C6.28207 7.68965 6.19567 7.57845 6.07247 7.49765C5.94847 7.41365 5.79407 7.37285 5.60767 7.37285C5.39487 7.37285 5.20286 7.42645 5.03646 7.53205C4.86686 7.63845 4.74447 7.79845 4.66687 8.01125C4.58847 8.22485 4.54927 8.53925 4.55087 8.95685L4.54927 11.4416H3.26367V4.39045H4.55087" fill="white" data-v-f151468c=""></path><path fill-rule="evenodd" clip-rule="evenodd" d="M9.6194 4.38965V7.11125C10.0338 6.61765 10.5298 6.36885 11.1058 6.36885C11.401 6.36885 11.669 6.42565 11.9074 6.53765C12.145 6.64965 12.3242 6.79285 12.4442 6.96645C12.5658 7.14245 12.6482 7.33445 12.6914 7.54645C12.7354 7.75765 12.7578 8.08565 12.7578 8.53125V11.4408H11.4722V8.82005C11.4722 8.30005 11.4482 7.97045 11.3986 7.83045C11.3498 7.68965 11.2642 7.57845 11.1394 7.49765C11.017 7.41365 10.861 7.37285 10.6746 7.37285C10.4618 7.37285 10.2706 7.42645 10.1034 7.53205C9.93541 7.63845 9.81301 7.79845 9.73461 8.01125C9.65781 8.22485 9.6186 8.53925 9.6186 8.95685V11.4416H8.33301V4.39045H9.6186" fill="white" data-v-f151468c=""></path></svg>
          <span>Перейти на аккаунт HH.ru</span>
        </div>
        <div class="dropdown-item">
          <svg data-v-f151468c="" width="14" height="16" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path data-v-f151468c="" d="M8.17363 14.6446H2.19354C1.82676 14.6446 1.5291 14.3469 1.5291 13.9801V2.01999C1.5291 1.65321 1.82679 1.35555 2.19354 1.35555H8.17363C8.54107 1.35555 8.83807 1.05855 8.83807 0.691111C8.83807 0.323674 8.54107 0.0266113 8.17363 0.0266113H2.19354C1.09454 0.0266113 0.200195 0.920986 0.200195 2.01999V13.9801C0.200195 15.0791 1.09454 15.9735 2.19354 15.9735H8.17363C8.54107 15.9735 8.83807 15.6765 8.83807 15.309C8.83807 14.9416 8.54107 14.6446 8.17363 14.6446Z" fill="#131313"></path><path data-v-f151468c="" d="M13.6026 7.52689L9.56271 3.54017C9.30224 3.28236 8.88099 3.2857 8.62318 3.54682C8.36537 3.80795 8.36802 4.22854 8.62984 4.48636L11.5169 7.33551H3.78065C3.41321 7.33551 3.11621 7.63251 3.11621 7.99995C3.11621 8.36739 3.41321 8.66442 3.78065 8.66442H11.5169L8.62984 11.5136C8.36806 11.7714 8.36606 12.192 8.62318 12.4531C8.68498 12.5158 8.75863 12.5656 8.83985 12.5996C8.92106 12.6336 9.00823 12.6511 9.09627 12.6511C9.26506 12.6511 9.43381 12.5873 9.56271 12.4597L13.6026 8.47301C13.6652 8.41116 13.715 8.3375 13.749 8.2563C13.783 8.17509 13.8005 8.08795 13.8006 7.99992C13.8006 7.82192 13.7295 7.65248 13.6026 7.52689Z" fill="#131313"></path></svg>
          <span>Выйти из HH.ru</span>
        </div>
        <div class="dropdown-item">
          <svg data-v-f151468c="" width="14" height="16" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path data-v-f151468c="" d="M8.17363 14.6446H2.19354C1.82676 14.6446 1.5291 14.3469 1.5291 13.9801V2.01999C1.5291 1.65321 1.82679 1.35555 2.19354 1.35555H8.17363C8.54107 1.35555 8.83807 1.05855 8.83807 0.691111C8.83807 0.323674 8.54107 0.0266113 8.17363 0.0266113H2.19354C1.09454 0.0266113 0.200195 0.920986 0.200195 2.01999V13.9801C0.200195 15.0791 1.09454 15.9735 2.19354 15.9735H8.17363C8.54107 15.9735 8.83807 15.6765 8.83807 15.309C8.83807 14.9416 8.54107 14.6446 8.17363 14.6446Z" fill="#131313"></path><path data-v-f151468c="" d="M13.6026 7.52689L9.56271 3.54017C9.30224 3.28236 8.88099 3.2857 8.62318 3.54682C8.36537 3.80795 8.36802 4.22854 8.62984 4.48636L11.5169 7.33551H3.78065C3.41321 7.33551 3.11621 7.63251 3.11621 7.99995C3.11621 8.36739 3.41321 8.66442 3.78065 8.66442H11.5169L8.62984 11.5136C8.36806 11.7714 8.36606 12.192 8.62318 12.4531C8.68498 12.5158 8.75863 12.5656 8.83985 12.5996C8.92106 12.6336 9.00823 12.6511 9.09627 12.6511C9.26506 12.6511 9.43381 12.5873 9.56271 12.4597L13.6026 8.47301C13.6652 8.41116 13.715 8.3375 13.749 8.2563C13.783 8.17509 13.8005 8.08795 13.8006 7.99992C13.8006 7.82192 13.7295 7.65248 13.6026 7.52689Z" fill="#131313"></path></svg>
          <span>Выход</span>
        </div>
      </div>
    </div>
  </header>
</template>

<style lang="scss" scoped>
@use '@/assets/css/variables' as *;

.header {
  background: $white;
  padding: $spacing-lg $spacing-2xl;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 1002; // Выше чем мобильное меню
  position: relative;

  // Mobile styles
  @media (max-width: 650px) {
    padding: $spacing-md $spacing-lg;
    z-index: 1002; // Убеждаемся что хедер поверх мобильного меню
  }

  .header-left {
    display: flex;
    align-items: center;

    .logo {
      display: flex;
      align-items: center;

    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-right: 10px;
    position: relative;

    // Mobile styles
    @media (max-width: 650px) {
      gap: 8px;
      margin-right: 0;
    }

    .notifications {
      position: relative;
      cursor: pointer;
      background-color: #f3f3f3;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 12px;
      width: 50px;
      height: 50px;
      cursor: pointer;
      border: 1px solid transparent;
      transition: all .3s ease;
      z-index: 1001; // Убеждаемся что колокольчик всегда видим

      // Mobile styles - всегда видим
      @media (max-width: 650px) {
        display: flex !important;
        visibility: visible !important;
        opacity: 1 !important;
      }

      &:hover {
        background-color: #e8e8e8;
        border-color: $primary-blue;
      }

      .notification-icon {
        width: $icon-md;
        height: $icon-md;
      }

      .notification-dot {
        position: absolute;
        top: 40px;
        right: -5px;
        width: 14px;
        height: 14px;
        background: #2563eb;
        border-radius: 50%;
        border: 2px solid white;
      }
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 20px;
      cursor: pointer;
      padding: $spacing-sm $spacing-md;
      border-radius: $border-radius;
      transition: background-color $transition-fast;

      .user-icon{
        position: relative;
        cursor: pointer;
        background-color: #f3f3f3;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 12px;
        width: 50px;
        height: 50px;
        cursor: pointer;
        border: 1px solid transparent;
        transition: all 0.3s ease;

        &:hover {
          background-color: #e8e8e8;
          border-color: $primary-blue;
        }
      }
      
      .user-avatar {
        width: $icon-md;
        height: $icon-md;
      }

      .user-details {
        display: flex;
        flex-direction: column;
        gap: 4px;

        .user-name {
          font-weight: 600;
          font-size: $font-lg;
          color: #222;
          line-height: 1.2;
        }

        .user-account {
          font-size: $font-xs;
          color: $text-secondary;
          line-height: 1.2;
          text-decoration: underline ;
        }
      }

      .dropdown-icon {
        transition: transform 0.3s ease;

        &.rotated {
          transform: rotate(180deg);
        }
      }
    }

    .dropdown-menu {
      position: absolute;
      top: 100%;
      right: 0;
      background: $white;
      border-radius: $border-radius;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      min-width: 200px;
      padding: $spacing-sm 0;
      margin-top: $spacing-sm;
      opacity: 0;
      visibility: hidden;
      transform: translateY(-10px);
      transition: all 0.3s ease;
      z-index: 1000;

      &.open {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
      }

      .dropdown-item {
        display: flex;
        align-items: center;
        gap: $spacing-md;
        padding: $spacing-md $spacing-lg;
        cursor: pointer;
        transition: background-color $transition-fast;
        font-size: $font-sm;
        color: $text-primary;

        &:hover {
          background: $hover-gray;
        }

        .dropdown-icon {
          width: $icon-sm;
          height: $icon-sm;
          opacity: 0.7;
        }
      }
    }

    .burger-menu {
      display: none;
      cursor: pointer;
      background-color: #f3f3f3;
      border-radius: 12px;
      width: 50px;
      height: 50px;
      border: 1px solid transparent;
      transition: all 0.3s ease;
      align-items: center;
      justify-content: center;

      &:hover {
        background-color: #e8e8e8;
        border-color: $primary-blue;
      }

      @media (max-width: 650px) {
        display: flex;
      }
    }

    .mobile-close-btn {
      display: none;
      cursor: pointer;
      background-color: #f3f3f3;
      border-radius: 12px;
      width: 50px;
      height: 50px;
      border: 1px solid transparent;
      transition: all 0.3s ease;
      align-items: center;
      justify-content: center;
      color: $text-primary;

      &:hover {
        background-color: #e8e8e8;
        border-color: $primary-blue;
      }

      @media (max-width: 650px) {
        display: flex;
      }
    }
  }

  // Utility classes for responsive visibility
  .desktop-only {
    @media (max-width: 650px) {
      display: none !important;
    }
  }

  .mobile-only {
    display: none;
    
    @media (max-width: 650px) {
      display: flex;
    }
  }
}
</style>
