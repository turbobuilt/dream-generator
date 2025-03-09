import "./lib/crypto";
import "./lib/pwa";
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import axios from "axios";
import { store } from "./store";
import { loadStripe } from '@stripe/stripe-js';
import { addConfig } from "./config";
import { getLoggedInUser } from "./lib/auth";
import BottomSheet from "./ui-elements/BottomSheet.vue";
import BottomComponent from "./ui-elements/BottomComponent.vue";
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'


if (window.location.href.includes("localhost") || window.location.href.match(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/)) {
    // if matches safari
    if (navigator.userAgent.toLocaleLowerCase().includes("firefox") || window.location.href.includes("firefox") || !navigator.userAgent.toLocaleLowerCase().includes("chrome")) {
        console.log("logging in special user with set token")
        let token = "FVA4YDCFdk126PmHmEDRdLAhh1Cz4HKG2sU049ELRb4="; // 42
        localStorage.setItem("token", token);
    } else {
        let token = "FVA4YDCFdk126PmHmEDRdLAhh1Cz4HKG2sU049ELRb4=";
        localStorage.setItem("token", token);
    }
}

if (window.location.href.includes("token")) {
    let token = window.location.href.split("token=")[1].split("&")[0];
    localStorage.setItem("token", token);
}

// set default authorizationtoken for all axios requests to store.token if it exists.  This needs to be in a hook that runs before any axios requests are made.
axios.interceptors.request.use(function (config) {
    if (store.token && config.url?.startsWith("/api")) {
        config.headers.authorizationtoken = store.token;
    }
    return config;
});


// check if localstorage "token" exists
var stripeLoaded = false;
let testKey = "pk_test_51JEIXQKQlgzQQuyipmwUlPksGPQKUTJfMIiWm25ny4z4pPnugXxCcqgHoU2zfrbFmrIqVHDJGy5tfuZ4VId0uWV700LGvwkDa8";
let liveKey = "pk_live_51JEIXQKQlgzQQuyifh0i96DauOzly8XZO7WRAd2CFQdASW3njxxdaojxbeojdBudrSNmaPxJPZwQCvIujEdiVEc5008GlrLMh2";

export const stripePromise = new Promise((resolve, reject) => {
    loadStripe(store.isTest ? testKey : liveKey).then(stripe => {
        stripeLoaded = true;
        resolve(stripe);
    }).catch(reject);
}) as any;

let startPath = window.location.pathname;
let lastRoute = localStorage.getItem("lastRoute");

const app = createApp(App);
app.component("bottom-sheet", BottomSheet);
app.component("bottom-component", BottomComponent);
addConfig(app);
app.use(router)
function handleReady() {
    let loader = document.querySelector(".main-loading-div") as HTMLElement;
    loader.style.opacity = "0";
    setTimeout(function () {
        loader.remove();
    });
    store.checkingAuthentication = false;
    if (!store.authenticatedUser && router.currentRoute.value.fullPath !== "/") {
        router.replace("/");
    }
    if (store.authenticatedUser) {
        if (lastRoute && lastRoute !== startPath) {
            router.push(lastRoute);
        }
    }
}
Promise.all([router.isReady(), getLoggedInUser()]).then(handleReady).catch(function (err) {
    console.error("Error in getting logged in user");
    handleReady();
})
app.mount('#app')