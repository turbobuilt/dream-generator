import "./lib/pwa";
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import axios from "axios";
import { store } from "./store";
import { loadStripe } from '@stripe/stripe-js';
// check if localstorage "token" exists

// set default authorizationtoken for all axios requests to store.token if it exists.  This needs to be in a hook that runs before any axios requests are made.
axios.interceptors.request.use(function (config) {
    // if localhost or dreamgenerator.ai
    if (store.token && config.url?.startsWith("/api")) {
        config.headers.authorizationtoken = store.token;
    }
    return config;
});


var stripeLoaded = false;
let testKey = "pk_test_51JEIXQKQlgzQQuyipmwUlPksGPQKUTJfMIiWm25ny4z4pPnugXxCcqgHoU2zfrbFmrIqVHDJGy5tfuZ4VId0uWV700LGvwkDa8";
let liveKey = "pk_live_51JEIXQKQlgzQQuyifh0i96DauOzly8XZO7WRAd2CFQdASW3njxxdaojxbeojdBudrSNmaPxJPZwQCvIujEdiVEc5008GlrLMh2";

export const stripePromise = new Promise((resolve,reject) => {
    loadStripe(store.isTest ? testKey : liveKey).then(stripe => {
        stripeLoaded = true;
        resolve(stripe);
    }).catch(reject);
}) as any;

// Vuetify
import { createVuetify } from 'vuetify'
import 'vuetify/styles'
// import { aliases, mdi } from 'vuetify/iconsets/mdi'
// import '@mdi/font/css/materialdesignicons.css' // Ensure you are using css-loader

export const vuetify = createVuetify({
    // primary color rgb(33, 150, 243)
    theme: {
        themes: {
            light: {
                colors: {
                    primary: "rgb(33, 150, 243)"
                }
            },
        },
    },
    // icons: {
    //     defaultSet: 'mdi',
    //     aliases,
    //     sets: {
    //         mdi,
    //     },
    // },
})
const app = createApp(App).use(vuetify)

app.use(router)
app.mount('#app')
