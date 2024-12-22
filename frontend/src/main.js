import './style.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useLoginStore } from './stores/loginStore'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.mount('#app')

const loginStore = useLoginStore();
loginStore.initialize();