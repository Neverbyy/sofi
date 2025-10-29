<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useSearchSettingsStore } from '../stores/searchSettings'
import type { Industry } from '../services/vacancyApi'

interface Props {
  isOpen: boolean
  selectedIndustries: string[]
}

interface Emits {
  (e: 'close'): void
  (e: 'update:selectedIndustries', industries: string[]): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const searchSettingsStore = useSearchSettingsStore()
const allIndustries = ref<Industry[]>([])
const isLoadingIndustries = ref(false)
const industriesError = ref<string | null>(null)

// Загрузка отраслей из API
const loadIndustries = async (): Promise<void> => {
  if (allIndustries.value.length > 0) {
    return // Уже загружены
  }

  if (isLoadingIndustries.value) {
    return // Уже загружается
  }

  isLoadingIndustries.value = true
  industriesError.value = null

  try {
    console.log('Начинаем загрузку отраслей...')
    const industries = await searchSettingsStore.getIndustries()
    console.log('Отрасли загружены:', industries)
    allIndustries.value = industries
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Ошибка при загрузке отраслей'
    industriesError.value = errorMessage
    console.error('Ошибка при загрузке отраслей:', error)
  } finally {
    isLoadingIndustries.value = false
    console.log('Загрузка завершена')
  }
}

// Загружаем отрасли при открытии модалки
watch(() => props.isOpen, (isOpen) => {
  if (isOpen && !isLoadingIndustries.value && allIndustries.value.length === 0) {
    loadIndustries()
  }
}, { immediate: false })

// Загружаем отрасли при монтировании компонента
onMounted(() => {
  if (props.isOpen) {
    loadIndustries()
  }
})

const handleToggleIndustry = (industry: Industry) => {
  const industryName = industry.name // Используем русское название
  const currentSelected = [...props.selectedIndustries]
  const index = currentSelected.indexOf(industryName)
  
  if (index > -1) {
    currentSelected.splice(index, 1)
  } else {
    currentSelected.push(industryName)
  }
  
  emit('update:selectedIndustries', currentSelected)
}

const handleClose = (): void => {
  emit('close')
}

const isIndustrySelected = (industry: Industry): boolean => {
  return props.selectedIndustries.includes(industry.name)
}
</script>

<template>
  <transition name="modal-fade">
    <div v-if="isOpen" class="modal-overlay" @click="handleClose">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2 class="modal-title">Выберите отрасли</h2>
          <button class="modal-close" @click="handleClose">
            <img src="/src/assets/img/close.png" alt="Close" />
          </button>
        </div>
        <div class="modal-body">
          <div v-if="isLoadingIndustries" class="loading-state">
            <div class="spinner"></div>
            <p>Загрузка отраслей...</p>
          </div>
          
          <div v-else-if="industriesError" class="error-state">
            <p>Ошибка при загрузке отраслей: {{ industriesError }}</p>
            <button class="retry-btn" @click="loadIndustries">Повторить</button>
          </div>
          
          <div v-else-if="allIndustries.length === 0" class="empty-state">
            <p>Отрасли не найдены</p>
          </div>
          
          <div v-else class="industries-grid">
            <div 
              v-for="industry in allIndustries" 
              :key="industry.id"
              class="industry-item"
              :class="{ selected: isIndustrySelected(industry) }"
              @click="handleToggleIndustry(industry)"
            >
              <span class="industry-text">{{ industry.name }}</span>
              <div class="checkbox-indicator" v-if="isIndustrySelected(industry)">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M13.5 4.5L6 12L2.5 8.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="modal-btn modal-btn-secondary" @click="handleClose">Отмена</button>
          <button class="modal-btn modal-btn-primary" @click="handleClose">Применить</button>
        </div>
      </div>
    </div>
  </transition>
</template>

<style lang="scss" scoped>
@use '@/assets/css/variables' as *;

// Modal styles
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1003;
}

.modal-content {
  background: $white;
  border-radius: $border-radius-lg;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transform: scale(1) translateY(0);
  transition: transform 0.3s ease;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $spacing-xl;
  border-bottom: 1px solid $border-gray;

  .modal-title {
    font-size: $font-lg;
    font-weight: 600;
    color: $text-primary;
    margin: 0;
  }

  .modal-close {
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

    &:hover {
      background: $hover-gray;
    }

    img {
      width: 16px;
      height: 16px;
    }
  }
}

.modal-body {
  flex: 1;
  padding: $spacing-xl;
  overflow-y: auto;

  .loading-state,
  .error-state,
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: $spacing-2xl;
    text-align: center;
    color: $text-gray;

    p {
      margin: $spacing-md 0 0 0;
      font-size: $font-sm;
    }

    .spinner {
      width: 32px;
      height: 32px;
      border: 3px solid $light-gray;
      border-top-color: $primary-blue;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    .retry-btn {
      margin-top: $spacing-md;
      padding: $spacing-sm $spacing-lg;
      background: $primary-blue;
      color: $white;
      border: none;
      border-radius: $border-radius;
      font-size: $font-sm;
      font-weight: 500;
      cursor: pointer;
      transition: background-color $transition-fast;

      &:hover {
        background: $dark-blue;
      }
    }
  }

  .industries-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: $spacing-sm;

    .industry-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: $spacing-md $spacing-lg;
      border: 2px solid $border-gray;
      border-radius: $border-radius;
      cursor: pointer;
      transition: all $transition-fast;
      background: $white;

      &:hover {
        border-color: $primary-blue;
        background: $light-blue;
      }

      &.selected {
        border-color: $primary-blue;
        background: $light-blue;
        color: $primary-blue;
      }

      .industry-text {
        font-size: $font-sm;
        font-weight: 500;
        color: inherit;
      }

      .checkbox-indicator {
        color: $primary-blue;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  }
}

.modal-footer {
  display: flex;
  gap: $spacing-md;
  padding: $spacing-xl;
  border-top: 1px solid $border-gray;
  justify-content: flex-end;

  .modal-btn {
    padding: $spacing-md $spacing-xl;
    border: none;
    border-radius: $border-radius;
    font-size: $font-sm;
    font-weight: 500;
    cursor: pointer;
    transition: all $transition-fast;

    &.modal-btn-secondary {
      background: $light-gray;
      color: $text-gray;

      &:hover {
        background: #e5e7eb;
      }
    }

    &.modal-btn-primary {
      background: $primary-blue;
      color: $white;

      &:hover {
        background: $dark-blue;
      }
    }
  }
}

// Modal animations
.modal-fade-enter-active {
  transition: all 0.3s ease;
}

.modal-fade-leave-active {
  transition: all 0.3s ease;
}

.modal-fade-enter-from {
  opacity: 0;
}

.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-from .modal-content {
  transform: scale(0.9) translateY(-20px);
}

.modal-fade-leave-to .modal-content {
  transform: scale(0.9) translateY(-20px);
}

.modal-fade-enter-to .modal-content,
.modal-fade-leave-from .modal-content {
  transform: scale(1) translateY(0);
}

// Spinner animation
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
