// Примеры использования API сервиса для работы с вакансиями

import { vacancyApiService } from '../services/vacancyApi'

// Пример 1: Получение всех позиций пользователя
export const exampleGetPositions = async () => {
  try {
    const positions = await vacancyApiService.getPositions()
    console.log('Позиции пользователя:', positions)
    return positions
  } catch (error) {
    console.error('Ошибка при получении позиций:', error)
  }
}

// Пример 2: Получение настроек поиска для конкретной позиции
export const exampleGetPositionPreferences = async (positionId: number) => {
  try {
    const preferences = await vacancyApiService.getPositionPreferences(positionId)
    console.log('Настройки поиска для позиции', positionId, ':', preferences)
    return preferences
  } catch (error) {
    console.error('Ошибка при получении настроек поиска:', error)
  }
}

// Пример 3: Обновление настроек поиска
export const exampleUpdatePreferences = async (positionId: number) => {
  try {
    const newPreferences = {
      keywords: 'Vue.js TypeScript',
      search_in_title: true,
      search_in_description: true,
      exclude_words: 'junior стажер',
      selected_industries: ['Программист, разработчик', 'Frontend Developer'],
      experience_level: 'middle'
    }

    const updatedPreferences = await vacancyApiService.updatePositionPreferences(positionId, newPreferences)
    console.log('Обновленные настройки:', updatedPreferences)
    return updatedPreferences
  } catch (error) {
    console.error('Ошибка при обновлении настроек:', error)
  }
}

// Пример 4: Переключение режима ручного запроса
export const exampleToggleManualQuery = async (positionId: number) => {
  try {
    const result = await vacancyApiService.toggleManualQuery(positionId)
    console.log('Режим ручного запроса:', result.manual_query_enabled ? 'включен' : 'выключен')
    return result
  } catch (error) {
    console.error('Ошибка при переключении режима ручного запроса:', error)
  }
}

// Пример 5: Получение количества вакансий
export const exampleGetTotalVacancies = async (positionId: number) => {
  try {
    const result = await vacancyApiService.getTotalVacancies(positionId)
    console.log('Общее количество вакансий для позиции', positionId, ':', result.total_vacancies)
    return result
  } catch (error) {
    console.error('Ошибка при получении количества вакансий:', error)
  }
}

// Пример 6: Полный цикл работы с API
export const exampleFullWorkflow = async () => {
  try {
    console.log('=== Начало полного цикла работы с API ===')
    
    // 1. Получаем все позиции
    const positions = await exampleGetPositions()
    if (!positions || positions.positions.length === 0) {
      console.log('У пользователя нет позиций')
      return
    }

    const positionId = positions.positions[0].position_id
    console.log('Используем позицию с ID:', positionId)

    // 2. Получаем текущие настройки поиска
    await exampleGetPositionPreferences(positionId)

    // 3. Обновляем настройки поиска
    await exampleUpdatePreferences(positionId)

    // 4. Получаем количество вакансий с новыми настройками
    await exampleGetTotalVacancies(positionId)

    // 5. Переключаем режим ручного запроса
    await exampleToggleManualQuery(positionId)

    console.log('=== Полный цикл работы с API завершен ===')
  } catch (error) {
    console.error('Ошибка в полном цикле работы с API:', error)
  }
}

// Пример 7: Использование с настройками из store
export const exampleWithStoreSettings = async (storeSettings: any) => {
  try {
    console.log('Получение количества вакансий на основе настроек из store...')
    const count = await vacancyApiService.getVacanciesCount(storeSettings)
    console.log('Найдено вакансий:', count)
    return count
  } catch (error) {
    console.error('Ошибка при получении количества вакансий:', error)
  }
}
