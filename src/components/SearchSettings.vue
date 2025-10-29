<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useSearchSettingsStore } from '../stores/searchSettings'
import type { Experience } from '../services/vacancyApi'
import IndustryModal from './IndustryModal.vue'
import IndustryTags from './IndustryTags.vue'
import ExcludeWordsTags from './ExcludeWordsTags.vue'
import KeywordsTags from './KeywordsTags.vue'
import SaveNotification from './SaveNotification.vue'

// Используем Pinia store
const searchSettingsStore = useSearchSettingsStore()

// Локальные состояния для UI
const isSelectOpen = ref(false)
const isModalOpen = ref(false)
const experiences = ref<Experience[]>([])
const isLoadingExperiences = ref(false)
const experiencesError = ref<string | null>(null)

// Загрузка уровней опыта из API
const loadExperiences = async (): Promise<void> => {
  if (experiences.value.length > 0) {
    return // Уже загружены
  }

  if (isLoadingExperiences.value) {
    return // Уже загружается
  }

  isLoadingExperiences.value = true
  experiencesError.value = null

  try {
    const loadedExperiences = await searchSettingsStore.getExperiences()
    experiences.value = loadedExperiences
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Ошибка при загрузке уровней опыта'
    experiencesError.value = errorMessage
  } finally {
    isLoadingExperiences.value = false
  }
}

// Загружаем настройки из localStorage при монтировании компонента
onMounted(() => {
  searchSettingsStore.loadSettings()
  loadExperiences()
})

const handleSave = async () => {
  // Сохраняем настройки в localStorage и через API через store с анимацией
  await searchSettingsStore.saveSettings()
}

const handleRemoveIndustry = (industry: string) => {
  searchSettingsStore.removeIndustry(industry)
}

const handleClearAllIndustries = () => {
  searchSettingsStore.clearAllIndustries()
}

const handleOpenModal = () => {
  isModalOpen.value = true
}

const handleCloseModal = () => {
  isModalOpen.value = false
}

const handleUpdateKeywords = (words: string) => {
  searchSettingsStore.updateKeywords(words)
}

const handleUpdateExcludeWords = (words: string) => {
  searchSettingsStore.updateExcludeWords(words)
}

const handleUpdateSelectedIndustries = (industries: string[]) => {
  searchSettingsStore.updateSelectedIndustries(industries)
}

const handleSelectToggle = () => {
  isSelectOpen.value = !isSelectOpen.value
}

// Маппинг ID уровня опыта на отображаемое название
const experienceDisplayMap: Record<string, string> = {
  'noExperience': 'Нет опыта',
  'between1And3': 'Junior',
  'between3And6': 'Middle',
  'moreThan6': 'Senior'
}

const handleSelectOption = (experienceId: string) => {
  searchSettingsStore.updateExperienceLevel(experienceId)
  isSelectOpen.value = false
}

const getExperienceText = (value: string) => {
  if (!value) {
    return 'Выберите уровень опыта'
  }
  
  // Используем маппинг для преобразования ID в название
  if (experienceDisplayMap[value]) {
    return experienceDisplayMap[value]
  }
  
  // Если нет в маппинге, ищем в загруженных данных
  const experience = experiences.value.find(exp => exp.id === value || exp.name === value)
  if (experience) {
    return experience.name
  }
  
  // Fallback на старые значения для обратной совместимости
  const fallbackOptions: Record<string, string> = {
    'no-experience': 'Нет опыта',
    'junior': 'Junior',
    'middle': 'Middle',
    'senior': 'Senior'
  }
  return fallbackOptions[value] || 'Выберите уровень опыта'
}

// Получение отображаемого названия для опыта
const getExperienceDisplayName = (experienceId: string): string => {
  return experienceDisplayMap[experienceId] || experienceId
}

// Форматирование числа с разделителями тысяч
const formatNumber = (num: number): string => {
  if (num === undefined || num === null) {
    return '0'
  }
  return num.toLocaleString('ru-RU')
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
                :keywords="searchSettingsStore.settings.keywords"
                @update:keywords="handleUpdateKeywords"
              />
              <div class="checkbox-group">
                <div class="checkbox-label-text">Искать</div>
                <label class="checkbox-label">
                  <input 
                    v-model="searchSettingsStore.settings.searchInTitle"
                    type="checkbox" 
                    class="checkbox-input"
                    @change="searchSettingsStore.updateSearchSettings(searchSettingsStore.settings.searchInTitle, searchSettingsStore.settings.searchInDescription)"
                  />
                  <span class="checkbox-custom"></span>
                  в названии вакансии
                </label>
                <label class="checkbox-label">
                  <input 
                    v-model="searchSettingsStore.settings.searchInDescription"
                    type="checkbox" 
                    class="checkbox-input"
                    @change="searchSettingsStore.updateSearchSettings(searchSettingsStore.settings.searchInTitle, searchSettingsStore.settings.searchInDescription)"
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
                :exclude-words="searchSettingsStore.settings.excludeWords"
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
                :selected-industries="searchSettingsStore.settings.selectedIndustries"
                @remove-industry="handleRemoveIndustry"
                @clear-all="handleClearAllIndustries"
              />
              <a href="#" class="change-link" @click.prevent="handleOpenModal">Изменить отрасли</a>
            </div>
          </div>

          <!-- Excluded companies -->
          <div class="form-group excluded-companies">
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
                    {{ searchSettingsStore.settings.experienceLevel ? getExperienceText(searchSettingsStore.settings.experienceLevel) : 'Выберите уровень опыта' }}
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
                    v-if="isLoadingExperiences"
                    class="dropdown-item loading"
                  >
                    Загрузка...
                  </div>
                  <div 
                    v-else-if="experiencesError"
                    class="dropdown-item error"
                  >
                    Ошибка: {{ experiencesError }}
                  </div>
                  <template v-else>
                    <div 
                      class="dropdown-item" 
                      @click="handleSelectOption('')"
                      :class="{ active: searchSettingsStore.settings.experienceLevel === '' || !searchSettingsStore.settings.experienceLevel }"
                    >
                      Выберите уровень опыта
                    </div>
                    <template v-if="experiences.length > 0">
                      <div 
                        v-for="experience in experiences"
                        :key="experience.id"
                        class="dropdown-item" 
                        @click="handleSelectOption(experience.id)"
                        :class="{ active: searchSettingsStore.settings.experienceLevel === experience.id }"
                      >
                        {{ getExperienceDisplayName(experience.id) }}
                      </div>
                    </template>
                    <template v-else>
                      <!-- Fallback опции если данные не загрузились -->
                      <div 
                        class="dropdown-item" 
                        @click="handleSelectOption('noExperience')"
                        :class="{ active: searchSettingsStore.settings.experienceLevel === 'noExperience' }"
                      >
                        Нет опыта
                      </div>
                      <div 
                        class="dropdown-item" 
                        @click="handleSelectOption('between1And3')"
                        :class="{ active: searchSettingsStore.settings.experienceLevel === 'between1And3' }"
                      >
                        Junior
                      </div>
                      <div 
                        class="dropdown-item" 
                        @click="handleSelectOption('between3And6')"
                        :class="{ active: searchSettingsStore.settings.experienceLevel === 'between3And6' }"
                      >
                        Middle
                      </div>
                      <div 
                        class="dropdown-item" 
                        @click="handleSelectOption('moreThan6')"
                        :class="{ active: searchSettingsStore.settings.experienceLevel === 'moreThan6' }"
                      >
                        Senior
                      </div>
                    </template>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Action buttons -->
        <div class="form-actions">
          <button @click="handleSave" class="save-btn" :disabled="searchSettingsStore.isLoading && searchSettingsStore.isManualSave">
            <div v-if="searchSettingsStore.isLoading && searchSettingsStore.isManualSave" class="spinner"></div>
            <img v-else src="/src/assets/img/save.png" alt="Save" class="btn-icon" />
            {{ searchSettingsStore.isLoading && searchSettingsStore.isManualSave ? 'Сохранение...' : 'Сохранить' }}
          </button>
          <div class="vacancies-count">
            <span class="vacancies-text">Найдено вакансий:</span>
            <span v-if="searchSettingsStore.isApiLoading" class="loading-spinner">
              <span class="spinner-dot"></span>
              <span class="spinner-dot"></span>
              <span class="spinner-dot"></span>
            </span>
            <span v-else class="vacancies-number">
              {{ formatNumber(searchSettingsStore.totalVacancies) }}
            </span>
          </div>
        </div>
        
        <!-- API Error Notification -->
        <div v-if="searchSettingsStore.apiError" class="api-error">
          <p>Ошибка API: {{ searchSettingsStore.apiError }}</p>
          <button @click="searchSettingsStore.clearApiError" class="close-error-btn">×</button>
        </div>
      </div>
    </div>

    <!-- Modal for industry selection -->
    <IndustryModal 
      :is-open="isModalOpen"
      :selected-industries="searchSettingsStore.settings.selectedIndustries"
      @close="handleCloseModal"
      @update:selected-industries="handleUpdateSelectedIndustries"
    />

    <!-- Save notification -->
    <SaveNotification :is-visible="searchSettingsStore.showSaveNotification" />
  </main>
</template>

<style lang="scss" scoped>
@use '@/assets/css/variables' as *;

.search-settings {
  flex: 1;
  padding: 40px;
  background: $bg-gray;
  overflow-y: auto;
  overflow-x: hidden;
  max-width: 100%;
  
  // Large desktop styles
  @media (max-width: 1400px) {
    padding: $spacing-xl;
  }

  // Desktop styles
  @media (max-width: 1200px) {
    padding: $spacing-lg;
  }

  // Tablet styles
  @media (max-width: 1100px) {
    padding: $spacing-lg;
  }
  
  // Mobile styles
  @media (max-width: 650px) {
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
    max-width: 100%;
    width: 100%;

    .settings-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: $spacing-lg;
      flex-shrink: 0;

      // Large desktop styles
      @media (max-width: 1400px) {
        margin-bottom: $spacing-lg;
      }

      // Desktop styles
      @media (max-width: 1200px) {
        margin-bottom: $spacing-md;
      }

      // Tablet styles
      @media (max-width: 1100px) {
        margin-bottom: $spacing-md;
      }

      // Mobile styles
      @media (max-width: 650px) {
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

        // Large desktop styles
        @media (max-width: 1400px) {
          gap: $spacing-lg;
        }

        // Desktop styles
        @media (max-width: 1200px) {
          gap: $spacing-md;
        }

        // Tablet styles
        @media (max-width: 1100px) {
          gap: $spacing-md;
        }

        // Mobile styles
        @media (max-width: 650px) {
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

          // Large desktop styles
          @media (max-width: 1400px) {
            font-size: $font-lg;
          }

          // Desktop styles
          @media (max-width: 1200px) {
            font-size: $font-lg;
          }

          // Tablet styles
          @media (max-width: 1100px) {
            font-size: $font-lg;
          }

          // Mobile styles
          @media (max-width: 650px) {
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
      max-width: 100%;
      width: 100%;
      box-sizing: border-box;

      // Large desktop styles
      @media (max-width: 1400px) {
        padding: $spacing-xl;
        gap: $spacing-lg;
      }

      // Desktop styles
      @media (max-width: 1200px) {
        padding: $spacing-lg;
        gap: $spacing-md;
      }

      // Tablet styles
      @media (max-width: 1100px) {
        padding: $spacing-xl;
        display: flex;
        flex-direction: column;
        gap: $spacing-lg;
      }

      // Mobile styles
      @media (max-width: 650px) {
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
          max-width: 100%;
          width: 100%;
          box-sizing: border-box;

          // Large desktop styles
          @media (max-width: 1400px) {
            gap: $spacing-lg;
            margin-bottom: $spacing-2xl;
          }

          // Desktop styles
          @media (max-width: 1200px) {
            gap: $spacing-md;
            margin-bottom: $spacing-xl;
          }

          // Tablet styles
          @media (max-width: 1100px) {
            display: flex;
            flex-direction: column;
            gap: $spacing-md;
            margin-bottom: $spacing-xl;
          }

          // Mobile styles
          @media (max-width: 650px) {
            display: flex;
            flex-direction: column;
            gap: $spacing-md;
            margin-bottom: $spacing-xl;
          }

          &:last-child {
            margin-bottom: 0;
          }

          // Скрываем секцию "Компании-исключения" на десктопе
          &.excluded-companies {
            display: none;

            @media (max-width: 650px) {
              display: flex;
              flex-direction: column;
              gap: $spacing-md;
              margin-bottom: $spacing-xl;
            }
          }

          .form-label-section {
            width: 250px;
            max-width: 100%;
            box-sizing: border-box;

            // Large desktop styles
            @media (max-width: 1400px) {
              width: 220px;
            }

            // Desktop styles
            @media (max-width: 1200px) {
              width: 200px;
            }

            // Tablet styles
            @media (max-width: 1100px) {
              width: 100%;
            }

            // Mobile styles
            @media (max-width: 650px) {
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
            max-width: 100%;
            box-sizing: border-box;

            // Large desktop styles
            @media (max-width: 1400px) {
              width: 450px;
            }

            // Desktop styles
            @media (max-width: 1200px) {
              width: 400px;
            }

            // Tablet styles
            @media (max-width: 1100px) {
              width: 100%;
            }

            // Mobile styles
            @media (max-width: 650px) {
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

        // Tablet styles
        @media (max-width: 1100px) {
          width: 100%;
          gap: $spacing-md;
          margin-top: $spacing-lg;
        }

        // Mobile styles
        @media (max-width: 650px) {
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
          transition: all $transition-fast;
          position: relative;
          min-height: 40px;

          &:disabled {
            opacity: 0.7;
            cursor: not-allowed;
          }

          // Tablet styles
          @media (max-width: 1100px) {
            padding: $spacing-lg $spacing-xl;
            font-size: $font-md;
            justify-content: center;
          }

          // Mobile styles
          @media (max-width: 650px) {
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

          // Tablet styles
          @media (max-width: 1100px) {
            padding: $spacing-lg $spacing-xl;
            font-size: $font-md;
            justify-content: center;
          }

          // Mobile styles
          @media (max-width: 650px) {
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

        .vacancies-count {
          display: flex;
          align-items: center;
          gap: $spacing-md;
          padding: $spacing-md $spacing-lg;
          justify-content: center;
          background: $white;
          border: 1px solid $primary-blue;
          border-radius: 999px; // Pill-shaped
          font-size: $font-sm;
          font-weight: 500;
          color: $text-primary;

          .vacancies-text {
            color: $text-primary;
            white-space: nowrap;
          }

          .vacancies-number {
            color: $text-primary;
            font-weight: 600;
          }

          .loading-spinner {
            display: flex;
            align-items: center;
            gap: 4px;

            .spinner-dot {
              width: 6px;
              height: 6px;
              border-radius: 50%;
              background: $primary-blue;
              animation: spinner-bounce 1.4s ease-in-out infinite both;

              &:nth-child(1) {
                animation-delay: -0.32s;
              }

              &:nth-child(2) {
                animation-delay: -0.16s;
              }

              &:nth-child(3) {
                animation-delay: 0s;
              }
            }
          }

          @keyframes spinner-bounce {
            0%, 80%, 100% {
              transform: scale(0);
              opacity: 0.5;
            }
            40% {
              transform: scale(1);
              opacity: 1;
            }
          }
        }

        .api-error {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: $spacing-md;
          padding: $spacing-md $spacing-lg;
          background: #fee;
          border: 1px solid #fcc;
          border-radius: $border-radius;
          color: #c33;

          p {
            margin: 0;
            font-size: $font-sm;
          }

          .close-error-btn {
            background: none;
            border: none;
            color: #c33;
            font-size: $font-lg;
            font-weight: bold;
            cursor: pointer;
            padding: 0;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: background-color $transition-fast;

            &:hover {
              background: rgba(204, 51, 51, 0.1);
            }
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

// Стили для спиннера
.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid $white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

</style>
