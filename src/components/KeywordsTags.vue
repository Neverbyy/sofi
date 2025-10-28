<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  keywords: string
}

interface Emits {
  (e: 'update:keywords', words: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const inputValue = ref('')
const keywordsList = ref<string[]>([])
const showSuggestions = ref(false)
const filteredSuggestions = ref<string[]>([])

// Список популярных ключевых слов для подсказок
const suggestions = ref([
  // Технологии и языки программирования
  'JavaScript', 'TypeScript', 'React', 'Vue', 'Angular', 'Node.js',
  'Python', 'Java', 'C#', 'PHP', 'Ruby', 'Go', 'Rust',
  'HTML', 'CSS', 'SCSS', 'SASS', 'Webpack', 'Vite',
  
  // Направления разработки
  'Frontend', 'Backend', 'Full-stack', 'DevOps', 'QA', 'Testing',
  'Фронтенд', 'Бэкенд', 'Фуллстек', 'ДевОпс', 'Тестирование',
  
  // Дизайн и UX
  'UI/UX', 'Design', 'UI Design', 'UX Design', 'Web Design',
  'UI/UX дизайн', 'Дизайн', 'Веб-дизайн', 'Интерфейс',
  
  // Менеджмент
  'Product Manager', 'Project Manager', 'Product Owner', 'Scrum Master',
  'Продакт-менеджер', 'Проджект-менеджер', 'Продакт-оунер', 'Скрам-мастер',
  
  // Аналитика и данные
  'Data Analyst', 'Data Scientist', 'Machine Learning', 'AI', 'Analytics',
  'Аналитик данных', 'Дата-сайентист', 'Машинное обучение', 'ИИ', 'Аналитика',
  
  // Мобильная разработка
  'Mobile Developer', 'iOS', 'Android', 'Flutter', 'React Native',
  'Мобильный разработчик', 'iOS разработчик', 'Android разработчик',
  
  // Разработка
  'Web Developer', 'Software Engineer', 'Developer', 'Programmer',
  'Веб-разработчик', 'Инженер-программист', 'Разработчик', 'Программист',
  
  // Системное администрирование
  'System Administrator', 'Database Administrator', 'Security Engineer', 'Cloud Engineer',
  'Системный администратор', 'Администратор БД', 'Инженер безопасности', 'Облачный инженер',
  
  // Маркетинг и продажи
  'Sales Manager', 'Marketing Manager', 'Digital Marketing', 'SMM',
  'Менеджер по продажам', 'Маркетинг-менеджер', 'Цифровой маркетинг', 'СММ',
  
  // HR и рекрутинг
  'HR Manager', 'Recruiter', 'HR Specialist', 'Talent Acquisition',
  'HR-менеджер', 'Рекрутер', 'HR-специалист', 'Поиск талантов',
  
  // Контент и SEO
  'Content Manager', 'SMM Manager', 'SEO Specialist', 'Content Creator',
  'Контент-менеджер', 'СММ-менеджер', 'SEO-специалист', 'Контент-мейкер',
  
  // Консалтинг и архитектура
  'Consultant', 'Architect', 'Solution Architect', 'Technical Lead',
  'Консультант', 'Архитектор', 'Архитектор решений', 'Техлид',
  
  // Уровни разработчиков
  'Lead Developer', 'Team Lead', 'Senior Developer', 'Middle Developer', 'Junior Developer',
  'Лид разработчик', 'Тимлид', 'Сеньор разработчик', 'Мидл разработчик', 'Джуниор разработчик',
  
  // Статусы работы
  'Intern', 'Freelancer', 'Remote', 'Office', 'Hybrid',
  'Стажер', 'Фрилансер', 'Удаленно', 'Офис', 'Гибрид'
])

// Парсим строку ключевых слов в массив
const parseKeywords = (wordsString: string) => {
  return wordsString
    .split(',')
    .map(word => word.trim())
    .filter(word => word.length > 0)
}

// Обновляем список при изменении пропса
watch(() => props.keywords, (newValue) => {
  keywordsList.value = parseKeywords(newValue)
}, { immediate: true })

const handleAddWord = () => {
  const word = inputValue.value.trim()
  if (word && !keywordsList.value.includes(word)) {
    keywordsList.value.push(word)
    updateKeywordsString()
    inputValue.value = ''
  }
}

const handleRemoveWord = (word: string) => {
  const index = keywordsList.value.indexOf(word)
  if (index > -1) {
    keywordsList.value.splice(index, 1)
    updateKeywordsString()
  }
}

const handleClearAll = () => {
  keywordsList.value = []
  updateKeywordsString()
}

const updateKeywordsString = () => {
  emit('update:keywords', keywordsList.value.join(', '))
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
      if (lastWord && !keywordsList.value.includes(lastWord)) {
        keywordsList.value.push(lastWord)
        updateKeywordsString()
      }
      inputValue.value = ''
      showSuggestions.value = false
    }
  } else {
    inputValue.value = value
    filterSuggestions(value)
  }
}

const filterSuggestions = (query: string) => {
  if (query.length < 2) {
    showSuggestions.value = false
    return
  }
  
  const filtered = suggestions.value.filter(suggestion =>
    suggestion.toLowerCase().includes(query.toLowerCase()) &&
    !keywordsList.value.includes(suggestion)
  )
  
  filteredSuggestions.value = filtered.slice(0, 8) // Показываем максимум 8 подсказок
  showSuggestions.value = filtered.length > 0
}

const handleSelectSuggestion = (suggestion: string) => {
  if (!keywordsList.value.includes(suggestion)) {
    keywordsList.value.push(suggestion)
    updateKeywordsString()
  }
  inputValue.value = ''
  showSuggestions.value = false
}

const handleInputFocus = () => {
  if (inputValue.value.length >= 2) {
    filterSuggestions(inputValue.value)
  }
}

const handleInputBlur = () => {
  // Небольшая задержка, чтобы клик по подсказке успел сработать
  setTimeout(() => {
    showSuggestions.value = false
  }, 150)
}
</script>

<template>
  <div class="keywords-tags">
    <div class="input-container">
      <div class="input-wrapper">
        <input 
          v-model="inputValue"
          @input="handleInputChange"
          @keypress="handleKeyPress"
          @focus="handleInputFocus"
          @blur="handleInputBlur"
          type="text" 
          class="form-input" 
          placeholder="Ключевые слова, через запятую"
        />
        
        <!-- Выпадающее окно с подсказками -->
        <div v-if="showSuggestions" class="suggestions-dropdown">
          <div 
            v-for="suggestion in filteredSuggestions" 
            :key="suggestion"
            class="suggestion-item"
            @mousedown="handleSelectSuggestion(suggestion)"
          >
            {{ suggestion }}
          </div>
        </div>
      </div>
      
      <div class="form-example">
        <span class="example-first">например,</span>
        <span class="example-second"> специалист по тестированию</span>
      </div>
    </div>
    
    <div v-if="keywordsList.length > 0" class="selected-keywords">
      <div class="keywords-header">
        <span class="keywords-count">Выбрано {{ keywordsList.length }} слов</span>
        <img 
          src="/src/assets/img/close.png" 
          alt="Clear all" 
          class="clear-all-icon"
          @click="handleClearAll"
        />
      </div>
      
      <div class="keywords-container">
        <transition-group name="tag-fade" tag="div" class="tags-container">
          <span 
            v-for="word in keywordsList" 
            :key="word"
            class="keyword-tag"
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

.keywords-tags {
  .input-container {
    margin-bottom: $spacing-md;
  }

  .input-wrapper {
    position: relative;
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

  .suggestions-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: $white;
    border: 1px solid $border-gray;
    border-radius: $border-radius;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    margin-top: 2px;
    max-height: 200px;
    overflow-y: auto;
    z-index: 1000;

    .suggestion-item {
      padding: $spacing-md $spacing-lg;
      cursor: pointer;
      transition: background-color $transition-fast;
      font-size: $font-sm;
      color: $text-primary;

      &:hover {
        background: $hover-gray;
      }

      &:first-child {
        border-radius: $border-radius $border-radius 0 0;
      }

      &:last-child {
        border-radius: 0 0 $border-radius $border-radius;
      }
    }
  }

  .form-example {
    font-size: $font-sm;
    margin-top: $spacing-sm;

    .example-first{
      color: #8B8B8B;
    }
    .example-second{
      color: $primary-blue;
    }
  }

  .selected-keywords {
    .keywords-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: $spacing-md;

      .keywords-count {
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

    .keywords-container {
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

      .keyword-tag {
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
