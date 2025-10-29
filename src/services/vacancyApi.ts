// Функция для маскирования чувствительных данных в логах
const maskSensitiveData = (data: any): any => {
  if (!data || typeof data !== 'object') return data
  
  const masked = { ...data }
  
  // Маскируем email
  if (masked.email) {
    const email = masked.email.toString()
    const [localPart, domain] = email.split('@')
    if (localPart && domain) {
      const maskedLocal = localPart.length > 2 
        ? localPart.substring(0, 2) + '*'.repeat(localPart.length - 2)
        : localPart
      masked.email = `${maskedLocal}@${domain}`
    }
  }
  
  // Маскируем user_id (показываем только первые 8 символов)
  if (masked.user_id) {
    const userId = masked.user_id.toString()
    masked.user_id = userId.length > 8 
      ? userId.substring(0, 8) + '...'
      : userId
  }
  
  // Маскируем telegram
  if (masked.telegram) {
    const telegram = masked.telegram.toString()
    masked.telegram = telegram.length > 3 
      ? telegram.substring(0, 3) + '*'.repeat(telegram.length - 3)
      : telegram
  }
  
  return masked
}

// Проверка на production режим
const isProduction = import.meta.env.PROD

// Безопасное логирование (только в development)
const safeLog = (message: string, data?: any) => {
  if (!isProduction) {
    if (data) {
      console.log(message, maskSensitiveData(data))
    } else {
      console.log(message)
    }
  }
}

// Примечание: Шифрование убрано, так как бэкенд не поддерживает расшифровку
// Данные отправляются в открытом виде, но хранятся в .env файле (не в коде)

// Типы для API ответов
export interface Position {
  title: string
  location: string | null
  resume_link: string
  salary: string
  notes: string
  remote: boolean
  apply_to_favorites: boolean
  currency: string
  category: string | null
  languages: string[] | null
  frameworks: string[] | null
  grade: string | null
  position_id: number
  user_id: string
  status: boolean
  created_at: string
  last_search: string | null
  search_results: any | null
  letter_type: string[]
}

export interface PositionsResponse {
  positions: Position[]
  positions_count: number
  positions_max_count: number
}

export interface SearchPreferences {
  position_id: number
  keywords: string[]
  search_in_title: boolean
  search_in_description: boolean
  exclude_words: string[]
  selected_industries: string[]
  experience_level: string
  manual_query_enabled?: boolean
}

export interface TotalVacanciesResponse {
  total_vacancies: number
  position_id: number
}

export interface Industry {
  id: string
  name: string
  name_en?: string
}

export interface IndustriesResponse {
  industries: Industry[]
}

export interface Experience {
  id: string
  name: string
  name_en?: string
}

export interface ExperiencesResponse {
  experiences: Experience[]
}

// Конфигурация API
// В development используем прокси через Vite, в production - относительный путь через Netlify прокси
// Netlify прокси настроен в netlify.toml для перенаправления /api/* на https://test.sofi-assistant.com/api/*
const API_BASE_URL = '/api'  // Используем относительный путь для работы через прокси (Vite в dev, Netlify в prod)

// Credentials из переменных окружения или localStorage
// ВАЖНО: В production credentials должны вводиться пользователем через форму авторизации
// Локально можно использовать .env файл для разработки
const getAuthCredentials = (): { username: string; password: string } => {
  // В development используем .env файл
  if (import.meta.env.DEV) {
    return {
      username: import.meta.env.VITE_AUTH_USERNAME || '',
      password: import.meta.env.VITE_AUTH_PASSWORD || ''
    }
  }
  
  // В production используем данные из sessionStorage (вводит пользователь)
  const storedUsername = sessionStorage.getItem('sofi_auth_username')
  const storedPassword = sessionStorage.getItem('sofi_auth_password')
  
  return {
    username: storedUsername || '',
    password: storedPassword || ''
  }
}

// Метод для установки credentials (вызывается из формы авторизации)
export const setAuthCredentials = (username: string, password: string): void => {
  sessionStorage.setItem('sofi_auth_username', username)
  sessionStorage.setItem('sofi_auth_password', password)
}

// Метод для очистки credentials
export const clearAuthCredentials = (): void => {
  sessionStorage.removeItem('sofi_auth_username')
  sessionStorage.removeItem('sofi_auth_password')
}

const AUTH_CREDENTIALS = getAuthCredentials()

// Проверка наличия credentials (более строгая проверка для production)
if (!AUTH_CREDENTIALS.username || !AUTH_CREDENTIALS.password) {
  const isProduction = import.meta.env.PROD
  if (isProduction) {
    console.warn('⚠️ Credentials не найдены. Пользователь должен авторизоваться через форму.')
  } else {
    console.warn('⚠️ ВНИМАНИЕ: Не заданы credentials для авторизации. Проверьте .env файл.')
  }
}

// Кэш для отраслей
let industriesCache: Industry[] | null = null

// Кэш для уровней опыта
let experiencesCache: Experience[] | null = null

// Класс для работы с API
class VacancyApiService {
  private baseUrl: string
  private isAuthenticated: boolean = false

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  // Преобразование объекта в application/x-www-form-urlencoded формат
  private encodeFormData(data: Record<string, string | boolean>): string {
    return Object.keys(data)
      .map(key => {
        const value = data[key]
        // Пропускаем boolean значения и undefined/null
        if (value === undefined || value === null || typeof value === 'boolean') {
          return ''
        }
        return `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`
      })
      .filter(Boolean)
      .join('&')
  }

  // Сброс авторизации (для повторной попытки при ошибках)
  private resetAuth(): void {
    this.isAuthenticated = false
  }

  // Проверка авторизации: сначала пытаемся использовать существующие cookies
  // Если cookies недействительны, выполняем авторизацию через /auth/login
  private async authenticate(): Promise<void> {
    if (this.isAuthenticated) {
      return
    }

    // Сначала пытаемся проверить, есть ли у нас рабочие cookies
    // Делаем простой запрос для проверки авторизации
    try {
      const testResponse = await fetch(`${this.baseUrl}/positions`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      })

      // Если запрос успешен (200-299), значит cookies уже есть и работают
      if (testResponse.ok) {
        this.isAuthenticated = true
        safeLog('Авторизация проверена: cookies уже установлены')
        return
      }

      // Если получили 401/403, нужно авторизоваться
      if (testResponse.status === 401 || testResponse.status === 403) {
        safeLog('Cookies недействительны, требуется авторизация')
        // Продолжаем выполнение ниже для выполнения /auth/login
      }
    } catch (error) {
      // Если произошла ошибка сети, все равно попробуем авторизоваться
      safeLog('Ошибка проверки авторизации, выполняем авторизацию')
    }

    // Получаем актуальные credentials (могут быть обновлены пользователем)
    const credentials = getAuthCredentials()
    
    if (!credentials.username || !credentials.password) {
      // Если credentials отсутствуют, выбрасываем ошибку
      // Это должно обрабатываться на уровне UI - показать форму авторизации
      throw new Error('Credentials not found. Please login through the authorization form.')
    }

    // Выполняем авторизацию через /auth/login
    try {
      const formData = this.encodeFormData({
        ...credentials,
        grant_type: 'password'
      })
      
      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        credentials: 'include', // Важно для работы с HttpOnly cookies
        body: formData
      })

      if (!response.ok) {
        const errorText = await response.text()
        this.resetAuth()
        throw new Error(`Ошибка авторизации: ${response.status} - ${errorText}`)
      }

      // Авторизация успешна, cookies установлены автоматически браузером
      // Важно: НЕ читаем response.json() - это предотвратит показ данных в DevTools
      this.isAuthenticated = true
      safeLog('Авторизация выполнена, cookies установлены')
    } catch (error) {
      this.resetAuth()
      console.error('Ошибка при авторизации:', error)
      throw error
    }
  }

  // Получение заголовков для запросов (cookies будут отправляться автоматически)
  private async getAuthHeaders(contentType: string = 'application/json'): Promise<HeadersInit> {
    await this.authenticate()
    return {
      'Content-Type': contentType,
    }
  }

  // Получение всех позиций пользователя
  async getPositions(): Promise<PositionsResponse> {
    try {
      const headers = await this.getAuthHeaders()
      const response = await fetch(`${this.baseUrl}/positions`, {
        method: 'GET',
        headers,
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error(`Ошибка получения позиций: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Ошибка при получении позиций:', error)
      throw error
    }
  }

  // Получение настроек поиска для конкретной позиции
  async getPositionPreferences(positionId: number): Promise<SearchPreferences> {
    try {
      const headers = await this.getAuthHeaders()
      const response = await fetch(`${this.baseUrl}/positions/${positionId}/preferences`, {
        method: 'GET',
        headers,
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error(`Ошибка получения настроек поиска: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Ошибка при получении настроек поиска:', error)
      throw error
    }
  }

  // Обновление настроек поиска для конкретной позиции
  async updatePositionPreferences(positionId: number, preferences: Omit<SearchPreferences, 'position_id'>): Promise<SearchPreferences> {
    try {
      const headers = await this.getAuthHeaders()
      const preferencesWithId: SearchPreferences = {
        ...preferences,
        position_id: positionId
      }
      
      const response = await fetch(`${this.baseUrl}/positions/${positionId}/preferences`, {
        method: 'PUT',
        headers,
        credentials: 'include',
        body: JSON.stringify(preferencesWithId)
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Ошибка обновления настроек поиска: ${response.status} - ${errorText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Ошибка при обновлении настроек поиска:', error)
      throw error
    }
  }

  // Переключение режима ручного запроса
  async toggleManualQuery(positionId: number): Promise<{ manual_query_enabled: boolean }> {
    try {
      const headers = await this.getAuthHeaders()
      const response = await fetch(`${this.baseUrl}/positions/${positionId}/preferences/manual_query/toggle`, {
        method: 'POST',
        headers,
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error(`Ошибка переключения режима ручного запроса: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Ошибка при переключении режима ручного запроса:', error)
      throw error
    }
  }

  // Получение общего количества вакансий для позиции
  async getTotalVacancies(positionId: number, preferences?: any): Promise<TotalVacanciesResponse> {
    try {
      const headers = await this.getAuthHeaders()
      
      // Если предпочтения не переданы, получаем их из API
      let searchPreferences = preferences
      if (!searchPreferences) {
        searchPreferences = await this.getPositionPreferences(positionId)
      }
      
      // Преобразуем предпочтения в формат API
      const requestBody = {
        keywords: Array.isArray(searchPreferences.keywords) ? searchPreferences.keywords : this.stringToArray(searchPreferences.keywords || ''),
        exclude_keywords: Array.isArray(searchPreferences.exclude_words) ? searchPreferences.exclude_words : this.stringToArray(searchPreferences.exclude_words || ''),
        search_in: this.buildSearchInArray(searchPreferences.search_in_title, searchPreferences.search_in_description),
        specializations: [], // Пока не используется
        industries: await this.translateIndustries(searchPreferences.selected_industries || []),
        excluded_employer_ids: [], // Пока не используется
        experience: searchPreferences.experience_level ? [searchPreferences.experience_level] : []
      }
      
      const response = await fetch(`${this.baseUrl}/positions/get-total-vacancies?position_id=${positionId}`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Ошибка получения количества вакансий: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      console.log('Ответ getTotalVacancies (сырой):', data)
      
      // Обрабатываем разные форматы ответа
      let result: TotalVacanciesResponse
      
      if (typeof data === 'number') {
        // Если API вернул просто число
        result = {
          total_vacancies: data,
          position_id: positionId
        }
      } else if (data.total_vacancies !== undefined) {
        // Если это объект с полем total_vacancies
        result = {
          total_vacancies: data.total_vacancies,
          position_id: data.position_id || positionId
        }
      } else if (data.total !== undefined) {
        // Если поле называется total
        result = {
          total_vacancies: data.total,
          position_id: data.position_id || positionId
        }
      } else if (data.count !== undefined) {
        // Если поле называется count
        result = {
          total_vacancies: data.count,
          position_id: data.position_id || positionId
        }
      } else {
        console.warn('Неожиданный формат ответа getTotalVacancies:', data)
        result = {
          total_vacancies: 0,
          position_id: positionId
        }
      }
      
      console.log('Обработанный результат getTotalVacancies:', result)
      return result
    } catch (error) {
      console.error('Ошибка при получении количества вакансий:', error)
      throw error
    }
  }

  // Построение массива search_in на основе настроек поиска
  private buildSearchInArray(searchInTitle: boolean, searchInDescription: boolean): string[] {
    const searchIn: string[] = []
    if (searchInTitle) searchIn.push('title')
    if (searchInDescription) searchIn.push('description')
    return searchIn
  }

  // Получение списка отраслей
  async getIndustries(): Promise<Industry[]> {
    if (industriesCache) {
      return industriesCache
    }

    try {
      const headers = await this.getAuthHeaders()
      const response = await fetch(`${this.baseUrl}/industries`, {
        method: 'GET',
        headers,
        credentials: 'include'
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Ошибка получения списка отраслей: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      console.log('Ответ API /industries:', data)
      
      // Проверяем различные форматы ответа
      let industries: Industry[] = []
      
      if (Array.isArray(data)) {
        // Если ответ - массив напрямую
        industries = data
      } else if (data.industries && Array.isArray(data.industries)) {
        // Если ответ - объект с полем industries
        industries = data.industries
      } else if (data.data && Array.isArray(data.data)) {
        // Если ответ - объект с полем data
        industries = data.data
      } else {
        console.warn('Неожиданный формат ответа API:', data)
        industries = []
      }
      
      industriesCache = industries
      console.log('Загружено отраслей:', industries.length)
      return industries
    } catch (error) {
      console.error('Ошибка при получении списка отраслей:', error)
      throw error
    }
  }

  // Получение списка уровней опыта
  async getExperiences(): Promise<Experience[]> {
    if (experiencesCache) {
      return experiencesCache
    }

    try {
      const headers = await this.getAuthHeaders()
      const response = await fetch(`${this.baseUrl}/positions/experiences`, {
        method: 'GET',
        headers,
        credentials: 'include'
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Ошибка получения списка уровней опыта: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      console.log('Ответ API /positions/experiences:', data)
      
      // Проверяем различные форматы ответа
      let experiences: Experience[] = []
      
      if (Array.isArray(data)) {
        // Если ответ - массив напрямую
        // Проверяем, является ли это массивом строк или объектов
        if (data.length > 0 && typeof data[0] === 'string') {
          // Преобразуем массив строк в массив объектов Experience
          experiences = data.map((id: string) => ({
            id: id,
            name: id // Временное значение, будет заменено маппингом в компоненте
          }))
        } else {
          // Это уже массив объектов
          experiences = data
        }
      } else if (data.experiences && Array.isArray(data.experiences)) {
        // Если ответ - объект с полем experiences
        if (data.experiences.length > 0 && typeof data.experiences[0] === 'string') {
          experiences = data.experiences.map((id: string) => ({
            id: id,
            name: id
          }))
        } else {
          experiences = data.experiences
        }
      } else if (data.data && Array.isArray(data.data)) {
        // Если ответ - объект с полем data
        if (data.data.length > 0 && typeof data.data[0] === 'string') {
          experiences = data.data.map((id: string) => ({
            id: id,
            name: id
          }))
        } else {
          experiences = data.data
        }
      } else {
        console.warn('Неожиданный формат ответа API:', data)
        experiences = []
      }
      
      experiencesCache = experiences
      console.log('Загружено уровней опыта:', experiences.length)
      return experiences
    } catch (error) {
      console.error('Ошибка при получении списка уровней опыта:', error)
      throw error
    }
  }

  // Преобразование русских названий отраслей в ID отраслей
  private async translateIndustries(industries: string[]): Promise<string[]> {
    try {
      const industriesList = await this.getIndustries()
      
      return industries.map(industryName => {
        // Ищем отрасль по русскому названию
        const industry = industriesList.find(ind => 
          ind.name === industryName || ind.name_en === industryName
        )
        return industry ? industry.id : industryName
      })
    } catch (error) {
      console.error('Ошибка при преобразовании отраслей:', error)
      // Возвращаем исходные названия в случае ошибки
      return industries
    }
  }

  // Преобразование строки в массив (разделение по запятым или пробелам)
  private stringToArray(str: string): string[] {
    if (!str || str.trim() === '') {
      return []
    }
    // Разделяем по запятым, затем по пробелам, фильтруем пустые строки
    return str
      .split(',')
      .flatMap(part => part.split(/\s+/))
      .map(item => item.trim())
      .filter(item => item.length > 0)
  }

  // Синхронизация настроек поиска с API
  async syncSearchSettingsWithApi(positionId: number, settings: any): Promise<void> {
    try {
      const preferences: Omit<SearchPreferences, 'position_id'> = {
        keywords: Array.isArray(settings.keywords) ? settings.keywords : this.stringToArray(settings.keywords),
        search_in_title: settings.searchInTitle,
        search_in_description: settings.searchInDescription,
        exclude_words: Array.isArray(settings.excludeWords) ? settings.excludeWords : this.stringToArray(settings.excludeWords),
        selected_industries: await this.translateIndustries(settings.selectedIndustries),
        experience_level: settings.experienceLevel
      }

      await this.updatePositionPreferences(positionId, preferences)
      console.log('Настройки поиска синхронизированы с API')
    } catch (error) {
      console.error('Ошибка при синхронизации настроек с API:', error)
      throw error
    }
  }

  // Получение количества вакансий на основе текущих настроек
  async getVacanciesCount(settings: any): Promise<number> {
    try {
      // Сначала получаем все позиции
      const positionsResponse = await this.getPositions()
      
      if (positionsResponse.positions.length === 0) {
        console.warn('У пользователя нет позиций')
        return 0
      }

      // Используем первую позицию (можно расширить логику выбора)
      const firstPosition = positionsResponse.positions[0]
      if (!firstPosition) {
        throw new Error('Не найдена ни одна позиция')
      }
      const positionId = firstPosition.position_id

      // Синхронизируем настройки с API
      await this.syncSearchSettingsWithApi(positionId, settings)

      // Получаем количество вакансий, передавая настройки
      const vacanciesResponse = await this.getTotalVacancies(positionId, settings)
      
      return vacanciesResponse.total_vacancies
    } catch (error) {
      console.error('Ошибка при получении количества вакансий:', error)
      throw error
    }
  }
}

// Создаем и экспортируем экземпляр сервиса
export const vacancyApiService = new VacancyApiService()

// Экспортируем класс для возможности создания дополнительных экземпляров
export { VacancyApiService }

// Глобальный перехватчик fetch - НЕ помогает полностью скрыть данные в DevTools
// DevTools показывает реальные сетевые запросы до обработки JavaScript
// Это ограничение браузера - полностью скрыть данные в DevTools невозможно
// 
// Решение: Используйте HTTPS (данные шифруются в транспорте)
// и храните credentials в .env файле (не в коде)
if (typeof window !== 'undefined') {
  // Оставляем оригинальный fetch без изменений
  // Перехватчик не поможет скрыть данные в DevTools
}