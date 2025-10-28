<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import IndustryModal from './IndustryModal.vue'
import IndustryTags from './IndustryTags.vue'
import ExcludeWordsTags from './ExcludeWordsTags.vue'
import KeywordsTags from './KeywordsTags.vue'

const keywords = ref('')
const searchInTitle = ref(true)
const searchInDescription = ref(false)
const excludeWords = ref('')
const selectedIndustries = ref([
  'Аналитик',
  'Гейм-дизайнер', 
  'Дизайнер, художник',
  'Менеджер продукта',
  'Программист, разработчик',
  'Продуктовый аналитик',
  'Сетевой инженер'
])
const experienceLevel = ref('')
const isSelectOpen = ref(false)
const isModalOpen = ref(false)

const handleSave = () => {
  console.log('Saving settings...')
}

const handleFindVacancies = () => {
  console.log('Finding vacancies...')
}

const handleRemoveIndustry = (industry: string) => {
  const index = selectedIndustries.value.indexOf(industry)
  if (index > -1) {
    selectedIndustries.value.splice(index, 1)
  }
}

const handleClearAllIndustries = () => {
  selectedIndustries.value = []
}

const handleOpenModal = () => {
  isModalOpen.value = true
}

const handleCloseModal = () => {
  isModalOpen.value = false
}

const handleUpdateKeywords = (words: string) => {
  keywords.value = words
}

const handleUpdateExcludeWords = (words: string) => {
  excludeWords.value = words
}

const handleUpdateSelectedIndustries = (industries: string[]) => {
  selectedIndustries.value = industries
}

const handleSelectToggle = () => {
  isSelectOpen.value = !isSelectOpen.value
}

const handleSelectOption = (value: string) => {
  experienceLevel.value = value
  isSelectOpen.value = false
}

const getExperienceText = (value: string) => {
  const options = {
    'no-experience': 'Без опыта',
    'junior': 'Junior (1-3 года)',
    'middle': 'Middle (3-5 лет)',
    'senior': 'Senior (5+ лет)'
  }
  return options[value as keyof typeof options] || 'Выберите уровень опыта'
}

const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement
  const selectWrapper = target.closest('.select-wrapper')
  
  if (!selectWrapper) {
    isSelectOpen.value = false
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
  <main class="search-settings">
    <div class="settings-container">
      <!-- Header -->
      <div class="settings-header">
        <div class="header-left">
          <div class="back-icon">
            <img src="/src/assets/img/back-arrow.png" alt="Back" />
          </div>
          <h1 class="settings-title">Настройка поиска</h1>
        </div>
        <div class="header-right">
          <a href="#" class="help-link">
            Как найти больше вакансий?
            <img src="/src/assets/img/balnce.png" alt="Arrow" class="arrow-icon" />
          </a>
        </div>
      </div>

      <!-- Form -->
      <div class="settings-form">
        <div class="form-content">
          <!-- Keywords -->
          <div class="form-group">
            <div class="form-label-section">
              <label class="form-label">
                Ключевые слова *
              </label>
              <p class="form-description">
                Слова, которые нужно искать в вакансии
              </p>
            </div>
            <div class="form-control-section">
              <KeywordsTags 
                :keywords="keywords"
                @update:keywords="handleUpdateKeywords"
              />
              <div class="checkbox-group">
                <div class="checkbox-label-text">Искать</div>
                <label class="checkbox-label">
                  <input 
                    v-model="searchInTitle"
                    type="checkbox" 
                    class="checkbox-input"
                  />
                  <span class="checkbox-custom"></span>
                  в названии вакансии
                </label>
                <label class="checkbox-label">
                  <input 
                    v-model="searchInDescription"
                    type="checkbox" 
                    class="checkbox-input"
                  />
                  <span class="checkbox-custom"></span>
                  в описании вакансии
                </label>
              </div>
            </div>
          </div>

          <!-- Exclude words -->
          <div class="form-group">
            <div class="form-label-section">
              <label class="form-label">Исключить слова</label>
              <p class="form-description">
                Убрать вакансии со словами
              </p>
            </div>
            <div class="form-control-section">
              <ExcludeWordsTags 
                :exclude-words="excludeWords"
                @update:exclude-words="handleUpdateExcludeWords"
              />
            </div>
          </div>

          <!-- Company industry -->
          <div class="form-group">
            <div class="form-label-section">
              <label class="form-label">Отрасль компании</label>
              <p class="form-description optional">необязательно</p>
            </div>
            <div class="form-control-section">
              <IndustryTags 
                :selected-industries="selectedIndustries"
                @remove-industry="handleRemoveIndustry"
                @clear-all="handleClearAllIndustries"
              />
              <a href="#" class="change-link" @click.prevent="handleOpenModal">Изменить отрасли</a>
            </div>
          </div>

          <!-- Excluded companies -->
          <div class="form-group">
            <div class="form-label-section">
              <label class="form-label">Компании-исключения</label>
              <p class="form-description optional">необязательно</p>
            </div>
            <div class="form-control-section">
              <div class="select-wrapper">
                <div class="custom-select">
                  <span class="select-text">Выберите компании для исключения</span>
                  <img 
                    src="/src/assets/img/arrow.png" 
                    alt="Dropdown" 
                    class="select-arrow"
                  />
                </div>
              </div>
              <p class="form-description">Софи не будет откликаться на вакансии этих компаний</p>
            </div>
          </div>

          <!-- Work experience -->
          <div class="form-group">
            <div class="form-label-section">
              <label class="form-label">Опыт работы</label>
              <p class="form-description optional">необязательно</p>
            </div>
            <div class="form-control-section">
              <div class="select-wrapper">
                <div 
                  class="custom-select"
                  @click="handleSelectToggle"
                >
                  <span class="select-text">
                    {{ experienceLevel ? getExperienceText(experienceLevel) : 'Выберите уровень опыта' }}
                  </span>
                  <img 
                    src="/src/assets/img/arrow.png" 
                    alt="Dropdown" 
                    class="select-arrow"
                    :class="{ rotated: isSelectOpen }"
                  />
                </div>
                
                <div class="dropdown-menu" :class="{ open: isSelectOpen, 'position-top': true }">
                  <div 
                    class="dropdown-item" 
                    @click="handleSelectOption('')"
                    :class="{ active: experienceLevel === '' }"
                  >
                    Выберите уровень опыта
                  </div>
                  <div 
                    class="dropdown-item" 
                    @click="handleSelectOption('no-experience')"
                    :class="{ active: experienceLevel === 'no-experience' }"
                  >
                    Без опыта
                  </div>
                  <div 
                    class="dropdown-item" 
                    @click="handleSelectOption('junior')"
                    :class="{ active: experienceLevel === 'junior' }"
                  >
                    Junior (1-3 года)
                  </div>
                  <div 
                    class="dropdown-item" 
                    @click="handleSelectOption('middle')"
                    :class="{ active: experienceLevel === 'middle' }"
                  >
                    Middle (3-5 лет)
                  </div>
                  <div 
                    class="dropdown-item" 
                    @click="handleSelectOption('senior')"
                    :class="{ active: experienceLevel === 'senior' }"
                  >
                    Senior (5+ лет)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Action buttons -->
        <div class="form-actions">
          <button @click="handleSave" class="save-btn">
            <img src="/src/assets/img/save.png" alt="Save" class="btn-icon" />
            Сохранить
          </button>
          <button @click="handleFindVacancies" class="find-btn">
            Найдено вакансий:
          </button>
        </div>
      </div>
    </div>

    <!-- Modal for industry selection -->
    <IndustryModal 
      :is-open="isModalOpen"
      :selected-industries="selectedIndustries"
      @close="handleCloseModal"
      @update:selected-industries="handleUpdateSelectedIndustries"
    />
  </main>
</template>

<style lang="scss" scoped>
@use '@/assets/css/variables' as *;

.search-settings {
  flex: 1;
  padding: 40px;
  background: $bg-gray;
  overflow-y: auto;
  
  // Mobile styles
  @media (max-width: 560px) {
    padding: 0;
    background: $white;
  }
  
  // Стилизация скроллбара для всей страницы
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;
    
    &:hover {
      background: #a8a8a8;
    }
  }

  .settings-container {
    margin: 0 auto;
    min-height: 100%;
    display: flex;
    flex-direction: column;

    .settings-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: $spacing-lg;
      flex-shrink: 0;

      // Mobile styles
      @media (max-width: 560px) {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
        margin-bottom: $spacing-md;
        padding: $spacing-lg;
        background: #f8f9fa;
      }

      .header-left {
        display: flex;
        align-items: center;
        gap: $spacing-lg;

        // Mobile styles
        @media (max-width: 560px) {
          gap: $spacing-md;
        }

        .back-icon {
          width: 50px;
          height: 50px;
          min-height: 50px;
          background: #ffffff;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          transition: all 0.3s ease;

          &:hover {
            background: #e5e7eb;
          }

          img {
            transition: transform 0.3s ease;
          }

          &:hover img {
            transform: translateX(-2px);
          }
        }

        .settings-title {
          font-size: $font-xl;
          font-weight: 700;
          color: $text-primary;
          margin: 0;

          // Mobile styles
          @media (max-width: 560px) {
            font-size: $font-lg;
          }
        }
      }

      .header-right {
        display: flex;
        align-items: center;

        .help-link {
          display: flex;
          align-items: center;
          gap: $spacing-sm;
          color: $primary-blue;
          text-decoration: underline;
          font-size: $font-sm;
          font-weight: 500;
          transition: all $transition-fast;

          &:hover {
            color: $dark-blue;
            text-decoration: none;
          }

          .arrow-icon {
            width: 10px;
            height: 14px;
          }
        }
      }
    }

    .settings-form {
      background: $white;
      border-radius: $border-radius-lg;
      padding: 40px;
      box-shadow: $shadow-sm;
      display: grid;
      grid-template-columns: 1fr auto;
      gap: $spacing-xl;
      align-items: start;

      // Mobile styles
      @media (max-width: 560px) {
        padding: $spacing-lg;
        border-radius: 0;
        box-shadow: none;
        display: flex;
        flex-direction: column;
        gap: $spacing-lg;
      }

      .form-content {
        .form-group {
          display: grid;
          grid-template-columns: 1fr 3fr;
          gap: $spacing-xl;
          margin-bottom: 40px;
          align-items: start;

          // Mobile styles
          @media (max-width: 560px) {
            display: flex;
            flex-direction: column;
            gap: $spacing-md;
            margin-bottom: $spacing-xl;
          }

          &:last-child {
            margin-bottom: 0;
          }

          .form-label-section {
            width: 250px;

            // Mobile styles
            @media (max-width: 560px) {
              width: 100%;
            }

            .form-label {
              display: block;
              font-weight: 600;
              font-size: $font-md;
              color: $text-primary;
            }

            .form-description {
              font-size: $font-sm;
              color: $text-secondary;
              margin: 0;

              &.optional {
                font-style: italic;
                margin-top: 4px;
              }
            }
          }

          .form-control-section {
            width: 500px;

            // Mobile styles
            @media (max-width: 560px) {
              width: 100%;
            }
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
          }
        }
      }

      .form-actions {
        display: flex;
        flex-direction: column;
        gap: $spacing-sm;
        justify-content: flex-start;

        // Mobile styles
        @media (max-width: 560px) {
          width: 100%;
          gap: $spacing-md;
          margin-top: $spacing-lg;
        }

        .save-btn {
          display: flex;
          align-items: center;
          gap: $spacing-sm;
          padding: $spacing-md $spacing-xl;
          background: $primary-blue;
          color: $white;
          border: none;
          border-radius: $border-radius;
          font-size: $font-sm;
          font-weight: 500;
          cursor: pointer;
          transition: background-color $transition-fast;

          // Mobile styles
          @media (max-width: 560px) {
            padding: $spacing-lg $spacing-xl;
            font-size: $font-md;
            justify-content: center;
          }

          &:hover {
            background: $dark-blue;
          }

          .btn-icon {
            width: $icon-sm;
            height: $icon-sm;
          }
        }

        .find-btn {
          display: flex;
          align-items: center;
          gap: $spacing-sm;
          padding: $spacing-md $spacing-xl;
          background: $button-blue;
          color: $primary-blue;
          border: none;
          border-radius: $border-radius;
          font-size: $font-sm;
          font-weight: 500;
          cursor: pointer;
          transition: background-color $transition-fast;

          // Mobile styles
          @media (max-width: 560px) {
            padding: $spacing-lg $spacing-xl;
            font-size: $font-md;
            justify-content: center;
          }

          &:hover {
            background: $hover-blue;
          }

          .btn-icon {
            width: $icon-sm;
            height: $icon-sm;
          }
        }
      }

      .form-control-section {
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

        .checkbox-group {
          display: flex;
          flex-direction: column;
          gap: $spacing-lg;
          margin-top: 30px;

          .checkbox-label-text {
            font-size: $font-sm;
            font-weight: 400;
            color: $text-primary;
          }

          .checkbox-label {
            display: flex;
            align-items: center;
            cursor: pointer;
            font-size: $font-sm;
            color: $text-gray;
            width: fit-content;

            .checkbox-input {
              display: none;

              &:checked + .checkbox-custom {
                background: $primary-blue;
                border-color: $primary-blue;

                &::after {
                  content: '';
                  position: absolute;
                  left: 6px;
                  top: 2px;
                  width: 6px;
                  height: 10px;
                  border: solid $white;
                  border-width: 0 2px 2px 0;
                  transform: rotate(45deg);
                }
              }
            }

            .checkbox-custom {
              width: $icon-md;
              height: $icon-md;
              border: 2px solid $border-gray;
              border-radius: $spacing-xs;
              margin-right: $spacing-md;
              position: relative;
              transition: all $transition-fast;
            }
          }
        }


        .change-link {
          color: $primary-blue;
          text-decoration: none;
          font-size: $font-sm;
          font-weight: 500;
        }

        .select-wrapper {
          position: relative;

          .custom-select {
            width: 100%;
            padding: $spacing-md $spacing-xl $spacing-md $spacing-lg;
            border: none;
            border-radius: $border-radius;
            font-size: $font-sm;
            background: #efefef;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: space-between;
            transition: border-color $transition-fast;

            &:hover {
              border-color: $primary-blue;
            }

            .select-text {
              color: $text-primary;
            }
          }

          .select-arrow {
            width: $icon-sm;
            height: $icon-sm;
            transition: transform 0.3s ease;

            &.rotated {
              transform: rotate(180deg);
            }
          }

          .dropdown-menu {
            position: absolute;
            top: auto;
            bottom: 100%;
            left: 0;
            right: 0;
            background: $white;
            border: 1px solid $border-gray;
            border-radius: $border-radius;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            margin-bottom: $spacing-xs;
            opacity: 0;
            visibility: hidden;
            transform: translateY(10px);
            transition: all 0.3s ease;
            z-index: 1000;
            overflow: hidden;

            &.open {
              opacity: 1;
              visibility: visible;
              transform: translateY(0);
            }

            .dropdown-item {
              padding: $spacing-md $spacing-lg;
              cursor: pointer;
              transition: background-color $transition-fast;
              font-size: $font-sm;
              color: $text-primary;

              &:hover {
                background: $hover-gray;
              }

              &.active {
                background: $primary-blue;
                color: $white;
              }

              &:first-child {
                border-radius: $border-radius $border-radius 0 0;
              }

              &:last-child {
                border-radius: 0 0 $border-radius $border-radius;
              }
            }
          }
        }
      }
    }
  }
}

</style>
