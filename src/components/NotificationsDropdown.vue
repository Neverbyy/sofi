<script setup lang="ts">
interface Props {
  isOpen: boolean
}

interface Emits {
  (e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const handleClose = () => {
  emit('close')
}
</script>

<template>
  <transition name="dropdown-fade">
    <div v-if="isOpen" class="notifications-dropdown">
      <div class="notifications-header">
        <h3 class="notifications-title">Уведомления</h3>
        <button class="notifications-close" @click="handleClose">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
      <div class="notifications-content">
        <div class="no-notifications">
          У вас нет новых уведомлений
        </div>
      </div>
    </div>
  </transition>
</template>

<style lang="scss" scoped>
@use '@/assets/css/variables' as *;

.notifications-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background: $white;
  border-radius: $border-radius-lg;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  min-width: 320px;
  max-width: 400px;
  margin-top: $spacing-sm;
  z-index: 1000;
  overflow: hidden;
  transform: scale(1) translateY(0);
  transition: transform 0.3s ease;

  .notifications-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $spacing-lg $spacing-xl;
    border-bottom: 1px solid $border-gray;
    background: $white;

    .notifications-title {
      font-size: $font-lg;
      font-weight: 600;
      color: $text-primary;
      margin: 0;
    }

    .notifications-close {
      width: 32px;
      height: 32px;
      background: none;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: $border-radius;
      transition: background-color $transition-fast;
      color: $text-secondary;

      &:hover {
        background: $hover-gray;
        color: $text-primary;
      }
    }
  }

  .notifications-content {
    padding: $spacing-xl;

    .no-notifications {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: $spacing-xl;
      background: $light-gray;
      border-radius: $border-radius;
      font-size: $font-sm;
      color: $text-secondary;
      text-align: center;
      min-height: 80px;
    }
  }
}

// Dropdown animations
.dropdown-fade-enter-active {
  transition: all 0.3s ease;
}

.dropdown-fade-leave-active {
  transition: all 0.3s ease;
}

.dropdown-fade-enter-from {
  opacity: 0;
  transform: scale(0.95) translateY(-10px);
}

.dropdown-fade-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-10px);
}

.dropdown-fade-enter-to,
.dropdown-fade-leave-from {
  opacity: 1;
  transform: scale(1) translateY(0);
}
</style>
