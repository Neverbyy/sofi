<template>
  <div class="login-overlay">
    <div class="login-modal">
      <div class="login-header">
        <h2>Авторизация</h2>
        <p>Введите ваши данные для входа в систему</p>
      </div>
      
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="username">Email</label>
          <input
            id="username"
            v-model="username"
            type="email"
            placeholder="your_email@example.com"
            required
            autocomplete="username"
            :class="{ 'input-error': error && !username }"
            @focus="error = ''"
          />
        </div>
        
        <div class="form-group">
          <label for="password">Пароль</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="Введите пароль"
            required
            autocomplete="current-password"
            :class="{ 'input-error': error && !password }"
            @focus="error = ''"
          />
        </div>
        
        <div v-if="error" class="error-message">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" class="error-icon">
            <path d="M8 6V10M8 14C4.68629 14 2 11.3137 2 8C2 4.68629 4.68629 2 8 2C11.3137 2 14 4.68629 14 8C14 11.3137 11.3137 14 8 14Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            <path d="M8 4H8.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          <span>{{ error }}</span>
        </div>
        
        <button type="submit" :disabled="isLoading" class="login-button">
          <span v-if="isLoading">Вход...</span>
          <span v-else>Войти</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { setAuthCredentials, vacancyApiService } from '../services/vacancyApi'

const emit = defineEmits<{
  (e: 'success'): void
}>()

const username = ref('')
const password = ref('')
const error = ref('')
const isLoading = ref(false)

const handleLogin = async () => {
  error.value = ''
  isLoading.value = true
  
  try {
    // Сохраняем credentials в sessionStorage
    setAuthCredentials(username.value, password.value)
    
    // Пытаемся авторизоваться
    // Это вызовет authenticate() который использует сохраненные credentials
    await vacancyApiService.getPositions()
    
    // Успешная авторизация
    emit('success')
  } catch (err: any) {
    // Парсим ошибку и показываем понятное сообщение
    let errorMessage = 'Ошибка авторизации. Проверьте правильность данных.'
    
    if (err.message) {
      // Пытаемся извлечь детали из JSON ответа сервера
      const match = err.message.match(/\{.*"detail":"([^"]+)"[^}]*\}/)
      if (match && match[1]) {
        const detail = match[1].toLowerCase()
        
        if (detail.includes('incorrect email') || detail.includes('incorrect password') || detail.includes('неверный')) {
          errorMessage = 'Неверный email или пароль. Проверьте правильность введенных данных.'
        } else if (detail.includes('invalid email')) {
          errorMessage = 'Неверный формат email. Проверьте правильность введенного адреса.'
        } else {
          errorMessage = `Ошибка: ${match[1]}`
        }
      } else if (err.message.includes('401') || err.message.includes('Unauthorized')) {
        errorMessage = 'Неверный email или пароль. Проверьте правильность введенных данных.'
      } else if (err.message.includes('400')) {
        errorMessage = 'Ошибка при отправке данных. Проверьте правильность введенных данных.'
      } else if (err.message.includes('Failed to fetch') || err.message.includes('Network')) {
        errorMessage = 'Ошибка подключения к серверу. Проверьте подключение к интернету.'
      } else {
        // Если не удалось распарсить, показываем оригинальное сообщение, но более читаемо
        errorMessage = err.message.replace(/Ошибка авторизации: \d+ - /, '')
      }
    }
    
    error.value = errorMessage
    // Очищаем credentials при ошибке
    setAuthCredentials('', '')
    // Очищаем поле пароля для безопасности
    password.value = ''
  } finally {
    isLoading.value = false
  }
}
</script>

<style lang="scss" scoped>
@use '@/assets/css/variables' as *;

.login-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: $spacing-lg;
}

.login-modal {
  background: $white;
  border-radius: 12px;
  padding: $spacing-xl;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.login-header {
  text-align: center;
  margin-bottom: $spacing-xl;
  
  h2 {
    font-size: $font-xl;
    font-weight: 600;
    color: $text-primary;
    margin-bottom: $spacing-sm;
  }
  
  p {
    font-size: $font-sm;
    color: $text-secondary;
  }
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: $spacing-xs;
  
  label {
    font-size: $font-sm;
    font-weight: 500;
    color: $text-primary;
  }
  
  input {
    padding: $spacing-md;
    border: 1px solid $border-gray;
    border-radius: 8px;
    font-size: $font-md;
    transition: border-color 0.2s;
    
    &:focus {
      outline: none;
      border-color: $primary-blue;
    }
    
    &.input-error {
      border-color: #f44;
    }
    
    &::placeholder {
      color: $text-secondary;
    }
  }
}

.error-message {
  padding: $spacing-md;
  background: #fee;
  border: 1px solid #fcc;
  border-radius: 8px;
  color: #c33;
  font-size: $font-sm;
  display: flex;
  align-items: flex-start;
  gap: $spacing-sm;
  
  .error-icon {
    flex-shrink: 0;
    margin-top: 2px;
  }
  
  span {
    flex: 1;
    line-height: 1.4;
  }
}

.login-button {
  padding: $spacing-md $spacing-lg;
  background: $primary-blue;
  color: $white;
  border: none;
  border-radius: 8px;
  font-size: $font-md;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover:not(:disabled) {
    background: darken($primary-blue, 10%);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}
</style>

