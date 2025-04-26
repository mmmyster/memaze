import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import './assets/css/general.css'
import './assets/css/board.css'
import './assets/css/effects.css'

const app = createApp(App)

app.use(router)

app.mount('#app')
