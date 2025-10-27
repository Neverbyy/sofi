<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  excludeWords: string
}

interface Emits {
  (e: 'update:excludeWords', words: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const inputValue = ref('')
const excludeWordsList = ref<string[]>([])

// Парсим строку исключаемых слов в массив
const parseExcludeWords = (wordsString: string) => {
  return wordsString
    .split(',')
    .map(word => word.trim())
    .filter(word => word.length > 0)
}

// Обновляем список при изменении пропса
watch(() => props.excludeWords, (newValue) => {
  excludeWordsList.value = parseExcludeWords(newValue)
}, { immediate: true })

const handleAddWord = () => {
  const word = inputValue.value.trim()
  if (word && !excludeWordsList.value.includes(word)) {
    excludeWordsList.value.push(word)
    updateExcludeWordsString()
    inputValue.value = ''
  }
}

const handleRemoveWord = (word: string) => {
  const index = excludeWordsList.value.indexOf(word)
  if (index > -1) {
    excludeWordsList.value.splice(index, 1)
    updateExcludeWordsString()
  }
}

const handleClearAll = () => {
  excludeWordsList.value = []
  updateExcludeWordsString()
}

const updateExcludeWordsString = () => {
  emit('update:excludeWords', excludeWordsList.value.join(', '))
}

const handleKeyPress = (event: KeyboardEvent) => {
  if (event.key === 'Enter' || event.key === ',') {
    event.preventDefault()
    handleAddWord()
  }
}

const handleInputChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = target.value
  
  // Если пользователь ввел запятую, добавляем слово
  if (value.includes(',')) {
    const words = value.split(',').map(w => w.trim()).filter(w => w.length > 0)
    if (words.length > 0) {
      const lastWord = words[words.length - 1]
      if (lastWord && !excludeWordsList.value.includes(lastWord)) {
        excludeWordsList.value.push(lastWord)
        updateExcludeWordsString()
      }
      inputValue.value = ''
    }
  } else {
    inputValue.value = value
  }
}
</script>

<template>
  <div class="exclude-words-tags">
    <div class="input-container">
      <input 
        v-model="inputValue"
        @input="handleInputChange"
        @keypress="handleKeyPress"
        type="text" 
        class="form-input" 
        placeholder="Исключить слова, через запятую"
      />
    </div>
    
    <div v-if="excludeWordsList.length > 0" class="selected-words">
      <div class="words-header">
        <span class="words-count">Выбрано {{ excludeWordsList.length }} слов</span>
        <img 
          src="/src/assets/img/close.png" 
          alt="Clear all" 
          class="clear-all-icon"
          @click="handleClearAll"
        />
      </div>
      
      <div class="words-container">
        <transition-group name="tag-fade" tag="div" class="tags-container">
          <span 
            v-for="word in excludeWordsList" 
            :key="word"
            class="word-tag"
          >
            {{ word }}
            <img 
              src="/src/assets/img/close.png" 
              alt="Remove" 
              class="remove-icon"
              @click="handleRemoveWord(word)"
            />
          </span>
        </transition-group>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/css/variables' as *;

.exclude-words-tags {
  .input-container {
    margin-bottom: $spacing-md;
  }

  .form-input {
    width: 100%;
    background: #efefef;
    padding: $spacing-md $spacing-lg;
    border: 1px solid transparent;
    border-radius: $border-radius;
    font-size: $font-sm;
    transition: border-color $transition-fast;

    &:focus {
      outline: none;
      border-color: $primary-blue;
    }
  }

  .selected-words {
    .words-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: $spacing-md;

      .words-count {
        font-size: $font-sm;
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

    .words-container {
      max-height: 100px;
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

      .word-tag {
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
}
</style>
