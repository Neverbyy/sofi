import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { vacancyApiService } from '../services/vacancyApi'
import type { Industry, Experience } from '../services/vacancyApi'

export interface SearchSettings {
  keywords: string
  searchInTitle: boolean
  searchInDescription: boolean
  excludeWords: string
  selectedIndustries: string[]
  experienceLevel: string
}

export const useSearchSettingsStore = defineStore('searchSettings', () => {
  // Состояние
  const settings = ref<SearchSettings>({
    keywords: '',
    searchInTitle: true,
    searchInDescription: false,
    excludeWords: '',
    selectedIndustries: [], // По умолчанию пустой массив
    experienceLevel: ''
  })

  // Состояния для UI
  const isLoading = ref(false)
  const showSaveNotification = ref(false)
  const isManualSave = ref(false)
  
  // Состояния для API
  const totalVacancies = ref<number>(0)
  const isApiLoading = ref(false)
  const apiError = ref<string | null>(null)
  const currentPositionId = ref<number | null>(null)

  // Ключ для localStorage
  const STORAGE_KEY = 'sofi-search-settings'

  // Старые дефолтные значения отраслей (для миграции)
  const OLD_DEFAULT_INDUSTRIES = [
    'Аналитик',
    'Гейм-дизайнер', 
    'Дизайнер, художник',
    'Менеджер продукта',
    'Программист, разработчик',
    'Продуктовый аналитик',
    'Сетевой инженер'
  ]

  // Проверка, являются ли отрасли старыми дефолтными значениями
  const isOldDefaultIndustries = (industries: string[]): boolean => {
    if (!industries || industries.length === 0) return false
    if (industries.length !== OLD_DEFAULT_INDUSTRIES.length) return false
    
    // Проверяем, что все отрасли соответствуют старым дефолтным значениям
    const sortedSaved = [...industries].sort()
    const sortedOld = [...OLD_DEFAULT_INDUSTRIES].sort()
    return JSON.stringify(sortedSaved) === JSON.stringify(sortedOld)
  }

  // Загрузка настроек из localStorage
  const loadSettings = (): void => {
    try {
      const savedSettings = localStorage.getItem(STORAGE_KEY)
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings)
        
        // Миграция: если selectedIndustries содержат старые дефолтные значения,
        // очищаем их (предполагаем, что пользователь еще не выбирал отрасли вручную)
        let selectedIndustries = parsedSettings.selectedIndustries || []
        if (isOldDefaultIndustries(selectedIndustries)) {
          selectedIndustries = []
          // Сохраняем очищенные данные обратно в localStorage
          parsedSettings.selectedIndustries = []
          localStorage.setItem(STORAGE_KEY, JSON.stringify(parsedSettings))
        }
        
        const defaultSettings = {
          ...settings.value,
          ...parsedSettings,
          selectedIndustries: selectedIndustries
        }
        settings.value = defaultSettings
      }
      // Если сохраненных настроек нет, settings.value остается с дефолтными значениями (пустой массив)
    } catch (error) {
      // Ошибка при загрузке настроек из localStorage
    }
  }

  // Автоматическое сохранение без анимации
  const autoSave = (): void => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings.value))
    } catch (error) {
      // Ошибка при автоматическом сохранении
    }
  }

  // Получение position_id пользователя
  const getPositionId = async (): Promise<number> => {
    if (currentPositionId.value) {
      return currentPositionId.value
    }

    try {
      const positionsResponse = await vacancyApiService.getPositions()
      
      if (positionsResponse.positions.length === 0) {
        throw new Error('У пользователя нет позиций')
      }

      const firstPosition = positionsResponse.positions[0]
      if (!firstPosition) {
        throw new Error('Не найдена ни одна позиция')
      }

      currentPositionId.value = firstPosition.position_id
      return currentPositionId.value
    } catch (error) {
      throw error
    }
  }

  // Получение списка отраслей из API
  const getIndustries = async (): Promise<Industry[]> => {
    try {
      const industries = await vacancyApiService.getIndustries()
      return industries
    } catch (error) {
      throw error // Пробрасываем ошибку дальше
    }
  }

  // Получение списка уровней опыта из API
  const getExperiences = async (): Promise<Experience[]> => {
    try {
      const experiences = await vacancyApiService.getExperiences()
      return experiences
    } catch (error) {
      throw error // Пробрасываем ошибку дальше
    }
  }

  // Ручное сохранение с анимацией и синхронизацией с API
  const saveSettings = async (): Promise<void> => {
    isManualSave.value = true
    isLoading.value = true
    isApiLoading.value = true
    showSaveNotification.value = false
    apiError.value = null
    
    try {
      // Сохраняем в localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings.value))
      
      // Получаем position_id
      const positionId = await getPositionId()
      
      // Функция для преобразования строки в массив
      const stringToArray = (str: string): string[] => {
        if (!str || str.trim() === '') {
          return []
        }
        return str
          .split(',')
          .flatMap(part => part.split(/\s+/))
          .map(item => item.trim())
          .filter(item => item.length > 0)
      }
      
      // Преобразуем настройки в формат API (отрасли будут преобразованы в API сервисе)
      const preferences = {
        keywords: stringToArray(settings.value.keywords),
        search_in_title: settings.value.searchInTitle,
        search_in_description: settings.value.searchInDescription,
        exclude_words: stringToArray(settings.value.excludeWords),
        selected_industries: settings.value.selectedIndustries, // Передаём как есть, преобразование в API
        experience_level: settings.value.experienceLevel
      }
      
      // Сохраняем настройки через API
      await vacancyApiService.updatePositionPreferences(positionId, preferences)
      
      // Получаем количество вакансий после сохранения
      try {
        const vacanciesResponse = await vacancyApiService.getTotalVacancies(positionId, preferences)
        
        // Обрабатываем разные форматы ответа
        let count = 0
        if (typeof vacanciesResponse === 'number') {
          count = vacanciesResponse
        } else if (vacanciesResponse && typeof vacanciesResponse === 'object') {
          const response = vacanciesResponse as any
          count = response.total_vacancies || response.total || response.count || 0
        }
        
        totalVacancies.value = count
      } catch (error) {
        totalVacancies.value = 0
      }
      
      // Показываем уведомление о сохранении
      showSaveNotification.value = true
      
      // Скрываем уведомление через 3 секунды
      setTimeout(() => {
        showSaveNotification.value = false
      }, 3000)
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ошибка при сохранении настроек'
      apiError.value = errorMessage
    } finally {
      isLoading.value = false
      isManualSave.value = false
      isApiLoading.value = false
    }
  }

  // Обновление настроек
  const updateSettings = (newSettings: Partial<SearchSettings>): void => {
    settings.value = { ...settings.value, ...newSettings }
  }

  // Обновление ключевых слов
  const updateKeywords = (keywords: string): void => {
    settings.value.keywords = keywords
  }

  // Обновление исключаемых слов
  const updateExcludeWords = (excludeWords: string): void => {
    settings.value.excludeWords = excludeWords
  }

  // Обновление выбранных отраслей
  const updateSelectedIndustries = (industries: string[]): void => {
    settings.value.selectedIndustries = industries
  }

  // Удаление отрасли
  const removeIndustry = (industry: string): void => {
    const index = settings.value.selectedIndustries.indexOf(industry)
    if (index > -1) {
      settings.value.selectedIndustries.splice(index, 1)
    }
  }

  // Очистка всех отраслей
  const clearAllIndustries = (): void => {
    settings.value.selectedIndustries = []
  }

  // Обновление уровня опыта
  const updateExperienceLevel = (level: string): void => {
    settings.value.experienceLevel = level
  }

  // Обновление настроек поиска
  const updateSearchSettings = (searchInTitle: boolean, searchInDescription: boolean): void => {
    settings.value.searchInTitle = searchInTitle
    settings.value.searchInDescription = searchInDescription
  }

  // Сброс настроек к значениям по умолчанию
  const resetSettings = (): void => {
    settings.value = {
      keywords: '',
      searchInTitle: true,
      searchInDescription: false,
      excludeWords: '',
      selectedIndustries: [], // По умолчанию пустой массив
      experienceLevel: ''
    }
  }

  // Получение количества вакансий через API
  const fetchVacanciesCount = async (): Promise<void> => {
    isApiLoading.value = true
    apiError.value = null
    
    try {
      const count = await vacancyApiService.getVacanciesCount(settings.value)
      totalVacancies.value = count || 0
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка API'
      apiError.value = errorMessage
      totalVacancies.value = 0
    } finally {
      isApiLoading.value = false
    }
  }

  // Синхронизация настроек с API
  const syncWithApi = async (): Promise<void> => {
    isApiLoading.value = true
    apiError.value = null
    
    try {
      await fetchVacanciesCount()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ошибка синхронизации с API'
      apiError.value = errorMessage
    } finally {
      isApiLoading.value = false
    }
  }

  // Очистка ошибки API
  const clearApiError = (): void => {
    apiError.value = null
  }

  // Автоматическое сохранение при изменении настроек (без анимации)
  watch(
    settings,
    () => {
      autoSave()
    },
    { deep: true }
  )

  return {
    // Состояние
    settings,
    isLoading,
    showSaveNotification,
    isManualSave,
    totalVacancies,
    isApiLoading,
    apiError,
    
    // Методы
    loadSettings,
    saveSettings,
    autoSave,
    updateSettings,
    updateKeywords,
    updateExcludeWords,
    updateSelectedIndustries,
    removeIndustry,
    clearAllIndustries,
    updateExperienceLevel,
    updateSearchSettings,
    resetSettings,
    fetchVacanciesCount,
    syncWithApi,
    clearApiError,
    getIndustries,
    getExperiences
  }
})
