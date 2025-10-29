<script setup lang="ts">
interface Props {
  selectedIndustries: string[]
}

interface Emits {
  (e: 'clear-all'): void
}

const { selectedIndustries } = defineProps<Props>()
const emit = defineEmits<Emits>()

const handleClearAll = () => {
  emit('clear-all')
}
</script>

<template>
  <div class="industry-tags">
    <div class="form-description">
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
    </div>
    <!-- Убираем отображение тегов по умолчанию -->
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

  // Убираем стили для selected-industries, так как теги больше не отображаются
}
</style>
