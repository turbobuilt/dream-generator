import { createApp, reactive } from 'vue'
import '@mdi/font/css/materialdesignicons.css' // Ensure you are using css-loader
import "./common.scss";
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import App from './App.vue'
import { router } from './lib/router'
import { store } from './store';
import { getModels } from './app/preload-old-connector';
import 

const vuetify = createVuetify({
    components,
    directives,
    icons: {
        defaultSet: 'mdi'
    },
})

export const app = createApp(App as any)
app.use(vuetify)
app.use(router);
app.mount('#app');
getModels().then((models: any) => {
    store.models = reactive(JSON.parse(JSON.stringify(models)));
});