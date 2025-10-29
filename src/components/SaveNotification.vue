<template>
  <Transition name="notification">
    <div v-if="isVisible" class="save-notification">
      <div class="notification-content">
        <div class="notification-icon">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16.6667 5L7.50004 14.1667L3.33337 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <span class="notification-text">Изменения сохранены</span>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
interface Props {
  isVisible: boolean
}

defineProps<Props>()
</script>

<style lang="scss" scoped>
@use '@/assets/css/variables' as *;

.save-notification {
  position: fixed;
  top: 20px;
  right: 20px;
  background: $white;
  border: 1px solid #e5e7eb;
  border-radius: $border-radius-lg;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  padding: $spacing-lg;
  min-width: 200px;

  .notification-content {
    display: flex;
    align-items: center;
    gap: $spacing-md;

    .notification-icon {
      width: 20px;
      height: 20px;
      color: #10b981;
      flex-shrink: 0;
    }

    .notification-text {
      font-size: $font-sm;
      font-weight: 500;
      color: $text-primary;
    }
  }
}

// Анимации
.notification-enter-active {
  transition: all 0.3s ease-out;
}

.notification-leave-active {
  transition: all 0.3s ease-in;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.notification-enter-to,
.notification-leave-from {
  opacity: 1;
  transform: translateX(0);
}

// Мобильные стили
@media (max-width: 650px) {
  .save-notification {
    top: 10px;
    right: 10px;
    left: 10px;
    min-width: auto;
  }
}
</style>
