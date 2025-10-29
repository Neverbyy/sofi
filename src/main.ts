import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './assets/css/main.scss'
import App from './App.vue'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.mount('#app')
