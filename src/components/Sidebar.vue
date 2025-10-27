<script setup lang="ts">
import { ref } from 'vue'

const activeItem = ref('positions')
const isCollapsed = ref(false)

const menuItems = [
  { id: 'dashboard', label: 'Дэшборд', icon: 'dashboard.png' },
  { id: 'positions', label: 'Позиции', icon: 'position.png' },
  { id: 'responses', label: 'Отклики', icon: 'otklik.png' },
  { id: 'subscription', label: 'Подписка', icon: 'sub.png' },
  { id: 'interviews', label: 'Интервью', icon: 'interviews.png' },
  { id: 'vacancies', label: 'Вакансии', icon: 'vacancies.png' }
]

const handleMenuClick = (itemId: string) => {
  activeItem.value = itemId
}

const handleCollapseToggle = () => {
  isCollapsed.value = !isCollapsed.value
}
</script>

<template>
  <aside class="sidebar" :class="{ collapsed: isCollapsed }">
    <!-- Collapse button -->
    <button class="collapse-btn" @click="handleCollapseToggle">
      <img 
        src="/src/assets/img/left-arrow.png" 
        alt="Collapse" 
        class="icon" 
      />
    </button>

    <!-- Navigation menu -->
    <nav class="nav-menu">
      <ul class="nav-list">
        <li 
          v-for="item in menuItems" 
          :key="item.id"
          class="nav-item"
          :class="{ active: activeItem === item.id }"
          @click="handleMenuClick(item.id)"
        >
          <img :src="`/src/assets/img/${item.icon}`" :alt="item.label" class="nav-icon" />
          <span class="nav-label" v-if="!isCollapsed">{{ item.label }}</span>
        </li>
      </ul>
    </nav>

    <!-- Daily responses card -->
    <div class="daily-responses" v-if="!isCollapsed">
      <div class="responses-info">
        <img src="/src/assets/img/otklik2.png" alt="Responses" class="responses-icon" />
        <div class="responses-text">
          <span class="responses-count">10 из 20</span>
          <span class="responses-label">Суточных откликов</span>
        </div>
      </div>
    </div>

    <!-- Bottom buttons -->
    <div class="bottom-buttons">
      <button class="bottom-btn">
        <span v-if="!isCollapsed">Инструкция</span>
        <img src="/src/assets/img/instr.png" alt="Instructions" class="btn-icon" />
      </button>
      <button class="bottom-btn">
        <span v-if="!isCollapsed">Поддержка</span>
        <img src="/src/assets/img/support.png" alt="Support" class="btn-icon" />
      </button>
    </div>
  </aside>
</template>

<style lang="scss" scoped>
@use '@/assets/css/variables' as *;

.sidebar {
  width: $sidebar-width;
  background: $white;
  display: flex;
  flex-direction: column;
  padding: 40px 0;
  transition: width 0.3s ease;
  overflow: hidden;

  &.collapsed {
    width: $sidebar-collapsed-width;
  }

  .collapse-btn {
    width: $icon-xxl;
    height: $icon-xxl;
    min-height: 50px;
    background: #f3f3f3;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    margin-bottom: 30px;
    margin-left: 27px;
    transition: all 0.3s ease;

    &:hover {
      background: #e5e7eb;
    }

    .icon {
      width: $icon-sm;
      height: $icon-sm;
      transition: transform 0.3s ease;
    }

    &:hover .icon {
      transform: translateX(-2px);
    }
  }

  &.collapsed .collapse-btn .icon {
    transform: rotate(180deg);
  }

  &.collapsed .collapse-btn:hover .icon {
    transform: rotate(180deg) translateX(2px);
  }

  .nav-menu {
    flex: 1;
    padding: 0 $spacing-xl;

    .nav-list {
      list-style: none;
      margin: 0;
      padding: 0;

      .nav-item {
        display: flex;
        align-items: center;
        padding: $spacing-md $spacing-lg;
        margin-bottom: $spacing-xs;
        border-radius: $border-radius;
        height: 60px;
        cursor: pointer;
        transition: all $transition-fast;
        position: relative;
        justify-content: flex-start;

        &:hover {
          background: $hover-gray;
        }

        &.active {
          background: $light-blue;
          color: $primary-blue;

          &::before {
            content: '';
            position: absolute;
            left: -$spacing-xl;
            top: 0;
            bottom: 0;
            width: $spacing-sm;
            background: $primary-blue;
            border-radius: 0 6px 6px 0;
          }
        }

        .nav-icon {
          width: $icon-lg;
          height: $icon-lg;
          margin-right: $spacing-md;
          flex-shrink: 0;
        }

        .nav-label {
          font-weight: 500;
          font-size: $font-lg;
          white-space: nowrap;
          opacity: 1;
          transition: opacity 0.3s ease;
        }
      }
    }
  }

  &.collapsed {
    .nav-menu {
      padding: 0 $spacing-sm;

      .nav-item {
        justify-content: center;
        padding: $spacing-md;

        .nav-icon {
          margin-right: 0;
        }

        &.active::before {
          left: -$spacing-sm;
        }
      }
    }

    .bottom-buttons {
      padding: 0 $spacing-sm;

      .bottom-btn {
        justify-content: center;
        padding: $spacing-md;
      }
    }
  }

  .daily-responses {
    margin: $spacing-xl;
    padding: $spacing-lg;
    background: $hover-gray;
    border-radius: $spacing-md;
    transition: opacity 0.3s ease;

    .responses-info {
      display: flex;
      align-items: center;

      .responses-icon {
        width: $icon-lg;
        height: $icon-lg;
        margin-right: $spacing-md;
      }

      .responses-text {
        display: flex;
        flex-direction: column;

        .responses-count {
          font-weight: 600;
          font-size: $font-md;
          color: $text-primary;
        }

        .responses-label {
          font-size: $font-xs;
          color: $text-secondary;
        }
      }
    }
  }

  .bottom-buttons {
    padding: 0 $spacing-xl;
    display: flex;
    flex-direction: column;
    gap: 20px;

    .bottom-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: $spacing-md $spacing-lg;
      background: $light-gray;
      border: none;
      border-radius: $border-radius;
      cursor: pointer;
      transition: background-color $transition-fast;
      font-weight: 600;
      font-size: $font-md;
      color: $text-gray;

      &:hover {
        background: #e5e7eb;
      }

      .btn-icon {
        width: 21px;
        height: 20px;
        margin-right: $spacing-sm;
        flex-shrink: 0;
      }
    }
  }
}
</style>
