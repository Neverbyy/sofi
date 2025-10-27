<script setup lang="ts">
interface Props {
  selectedIndustries: string[]
}

interface Emits {
  (e: 'remove-industry', industry: string): void
  (e: 'clear-all'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const handleRemoveIndustry = (industry: string) => {
  emit('remove-industry', industry)
}

const handleClearAll = () => {
  emit('clear-all')
}
</script>

<template>
  <div class="industry-tags">
    <p class="form-description">
      Вы выбрали
      <div class="form-description__subtitle">
        <span class="industries-count">{{ selectedIndustries.length }} отраслей</span>
        <img 
          v-if="selectedIndustries.length > 0"
          src="/src/assets/img/close.png" 
          alt="Clear all" 
          class="clear-all-icon"
          @click="handleClearAll"
        />
      </div>
    </p>
    <div class="selected-industries">
      <transition-group name="tag-fade" tag="div" class="tags-container">
        <span 
          v-for="industry in selectedIndustries" 
          :key="industry"
          class="industry-tag"
        >
          {{ industry }}
          <img 
            src="/src/assets/img/close.png" 
            alt="Remove" 
            class="remove-icon"
            @click="handleRemoveIndustry(industry)"
          />
        </span>
      </transition-group>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/css/variables' as *;

.industry-tags {
  .form-description {
    font-size: $font-sm;
    color: $text-secondary;
    margin-bottom: $spacing-md;
    display: flex;
    gap: 8px;
    align-items: center;

    &__subtitle{
      display: flex;
      gap: 3px;
    }

    .industries-count {
      color: $primary-blue;
      font-weight: 500;
    }

    .clear-all-icon {
      width: $icon-xs;
      height: $icon-xs;
      cursor: pointer;
      opacity: 0.8;
      transition: opacity $transition-fast;

      &:hover {
        opacity: 1;
      }
    }
  }

  .selected-industries {
    margin-bottom: $spacing-lg;
    max-height: 150px;
    overflow-y: auto;
    
    // Стилизация скроллбара
    &::-webkit-scrollbar {
      width: 6px;
    }
    
    &::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 3px;
    }
    
    &::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 3px;
      
      &:hover {
        background: #a8a8a8;
      }
    }

    .tags-container {
      display: flex;
      flex-wrap: wrap;
      gap: $spacing-sm;
      padding-right: 8px;
    }

    // Анимация для transition-group
    .tag-fade-enter-active,
    .tag-fade-leave-active {
      transition: all 0.3s ease;
    }

    .tag-fade-enter-from {
      opacity: 0;
      transform: scale(0.8);
    }

    .tag-fade-leave-to {
      opacity: 0;
      transform: scale(0.8);
    }

    .tag-fade-move {
      transition: transform 0.3s ease;
    }

    .industry-tag {
      display: flex;
      align-items: center;
      gap: $spacing-sm;
      padding: $spacing-sm $spacing-md;
      background: $light-gray;
      border-radius: $border-radius-xl;
      font-size: $font-sm;
      color: $text-gray;

      .remove-icon {
        width: $icon-sm;
        height: $icon-sm;
        cursor: pointer;
        opacity: 0.6;

        &:hover {
          opacity: 1;
        }
      }
    }
  }
}
</style>
