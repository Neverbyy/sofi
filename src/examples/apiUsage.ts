// Примеры использования API сервиса для работы с вакансиями

import { vacancyApiService } from '../services/vacancyApi'

// Пример 1: Получение всех позиций пользователя
export const exampleGetPositions = async () => {
  try {
    const positions = await vacancyApiService.getPositions()
    return positions
  } catch (error) {
    // Ошибка при получении позиций
  }
}

// Пример 2: Получение настроек поиска для конкретной позиции
export const exampleGetPositionPreferences = async (positionId: number) => {
  try {
    const preferences = await vacancyApiService.getPositionPreferences(positionId)
    return preferences
  } catch (error) {
    // Ошибка при получении настроек поиска
  }
}

// Пример 3: Обновление настроек поиска
export const exampleUpdatePreferences = async (positionId: number) => {
  try {
    const newPreferences = {
      keywords: ['Vue.js', 'TypeScript'],
      search_in_title: true,
      search_in_description: true,
      exclude_words: ['junior', 'стажер'],
      selected_industries: ['Программист, разработчик', 'Frontend Developer'],
      experience_level: 'middle'
    }

    const updatedPreferences = await vacancyApiService.updatePositionPreferences(positionId, newPreferences)
    return updatedPreferences
  } catch (error) {
    // Ошибка при обновлении настроек
  }
}

// Пример 4: Переключение режима ручного запроса
export const exampleToggleManualQuery = async (positionId: number) => {
  try {
    const result = await vacancyApiService.toggleManualQuery(positionId)
    return result
  } catch (error) {
    // Ошибка при переключении режима ручного запроса
  }
}

// Пример 5: Получение количества вакансий
export const exampleGetTotalVacancies = async (positionId: number) => {
  try {
    const result = await vacancyApiService.getTotalVacancies(positionId)
    return result
  } catch (error) {
    // Ошибка при получении количества вакансий
  }
}

// Пример 6: Полный цикл работы с API
export const exampleFullWorkflow = async () => {
  try {
    // 1. Получаем все позиции
    const positions = await exampleGetPositions()
    if (!positions || positions.positions.length === 0) {
      return
    }

    const firstPosition = positions.positions[0]
    if (!firstPosition) {
      return
    }
    
    const positionId = firstPosition.position_id

    // 2. Получаем текущие настройки поиска
    await exampleGetPositionPreferences(positionId)

    // 3. Обновляем настройки поиска
    await exampleUpdatePreferences(positionId)

    // 4. Получаем количество вакансий с новыми настройками
    await exampleGetTotalVacancies(positionId)

    // 5. Переключаем режим ручного запроса
    await exampleToggleManualQuery(positionId)
  } catch (error) {
    // Ошибка в полном цикле работы с API
  }
}

// Пример 7: Использование с настройками из store
export const exampleWithStoreSettings = async (storeSettings: any) => {
  try {
    const count = await vacancyApiService.getVacanciesCount(storeSettings)
    return count
  } catch (error) {
    // Ошибка при получении количества вакансий
  }
}
