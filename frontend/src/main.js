import './style.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useLoginStore } from './stores/loginStore'
import { useCartStore } from './stores/cartStore'
import scrollAppearDirective from "./directives/scroll-appear.js";

const app = createApp(App)
app.directive('scroll-appear', scrollAppearDirective);
app.use(createPinia())
app.use(router)
app.mount('#app')

const loginStore = useLoginStore();
const cartStore = useCartStore();
cartStore.loadCartFromStorage();
loginStore.initialize();