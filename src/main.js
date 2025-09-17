import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import 'lib-flexible/flexible'
import { Button } from 'vant';
import 'vant/lib/index.css';

import App from './App.vue'
import router from './router'
const env = import.meta.env.VITE_APP_ENV
import VConsole from 'vconsole';
console.log('env:::::::', env)
if (env !== 'production') {
    new VConsole();
}

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(Button);

app.mount('#app')


