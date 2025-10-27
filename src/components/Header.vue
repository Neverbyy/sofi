<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import NotificationsDropdown from './NotificationsDropdown.vue'

const isDropdownOpen = ref(false)
const isNotificationsOpen = ref(false)

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

const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement
  const userInfo = target.closest('.user-info')
  const dropdownMenu = target.closest('.dropdown-menu')
  const notifications = target.closest('.notifications')
  const notificationsDropdown = target.closest('.notifications-dropdown')
  
  if (!userInfo && !dropdownMenu) {
    isDropdownOpen.value = false
  }
  
  if (!notifications && !notificationsDropdown) {
    isNotificationsOpen.value = false
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
      <img src="/src/assets/img/logo.png" alt="Софи" class="logo" />
    </div>
    
    <div class="header-right">
      <div class="notifications" @click="handleNotificationsToggle">
        <img src="/src/assets/img/notification.png" alt="Notifications" class="notification-icon" />
        <div class="notification-dot"></div>
      </div>
      
      <div class="user-info" @click="handleDropdownToggle">
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
          <img src="/src/assets/img/dashboard.png" alt="HH" class="dropdown-icon" />
          <span>Перейти на аккаунт HH.ru</span>
        </div>
        <div class="dropdown-item">
          <img src="/src/assets/img/dashboard.png" alt="Logout" class="dropdown-icon" />
          <span>Выйти из HH.ru</span>
        </div>
        <div class="dropdown-item">
          <img src="/src/assets/img/dashboard.png" alt="Exit" class="dropdown-icon" />
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
  z-index: 10;
  position: relative;

  .header-left {
    display: flex;
    align-items: center;

  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 4px;
    position: relative;

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
      gap: 15px;
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
          color: $text-primary;
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
  }
}
</style>
