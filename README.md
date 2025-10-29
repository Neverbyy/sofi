# Sofi Assistant

Vue.js приложение для работы с API Sofi Assistant.

## Локальная разработка

1. Установите зависимости:
```bash
npm install
```

2. Создайте файл `.env` в корне проекта:
```env
VITE_AUTH_USERNAME=your_email@example.com
VITE_AUTH_PASSWORD=your_password
VITE_API_BASE_URL=https://test.sofi-assistant.com/api
```

3. Запустите dev-сервер:
```bash
npm run dev
```

## Деплой на Netlify

Приложение автоматически деплоится на Netlify при пуше в ветку `main`.

### Настройка Netlify

1. Подключите репозиторий к Netlify
2. Настройки билда будут автоматически подхвачены из `netlify.toml`
3. **Важно:** Настройте переменные окружения в **Site settings → Environment variables**:
   - `VITE_AUTH_USERNAME` = ваш email
   - `VITE_AUTH_PASSWORD` = ваш пароль
4. Приложение будет доступно по адресу Netlify (например: `https://your-app-name.netlify.app`)

### ⚠️ Важно: Настройка переменных окружения

Для работы приложения на Netlify необходимо настроить переменные окружения в Netlify Dashboard:
- Перейдите в **Site settings → Environment variables**
- Добавьте `VITE_AUTH_USERNAME` и `VITE_AUTH_PASSWORD`

**Без этих переменных приложение не сможет авторизоваться на API!**

### Ручной деплой

```bash
# Сборка для production
npm run build

# Предварительный просмотр
npm run preview
```

## Деплой на GitHub Pages

Приложение автоматически деплоится на GitHub Pages при пуше в ветку `main`.

### Настройка GitHub Pages

1. Перейдите в Settings → Pages вашего репозитория
2. В разделе "Source" выберите "GitHub Actions"
3. Приложение будет доступно по адресу: `https://yourusername.github.io/sofi/`

### Ручной деплой

```bash
# Сборка для production
npm run build

# Предварительный просмотр
npm run preview
```

## Структура проекта

- `src/components/` - Vue компоненты
- `src/services/` - API сервисы
- `src/stores/` - Pinia stores
- `src/assets/` - Статические ресурсы

## Технологии

- Vue 3
- TypeScript
- Pinia
- Vite
- SCSS