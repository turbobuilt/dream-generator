// import ./pwaServiceWorker.ts as url

import { store } from "@/store";
import { c } from "vite/dist/node/types.d-aGj9QkWt";
import { postToPwa, stopListeners, submitListeners } from "./postMessageToPwa";
import { watch } from "vue";

if (navigator?.serviceWorker?.controller) {
    navigator.serviceWorker.oncontrollerchange = () => {
        console.log("controllerchange");
        submitListeners();
    };
}
// watch(() => store.token, (newVal, oldVal) => {
//     if (!oldVal && !newVal)
//         return;
//     if (store.lastTokenSentToSse === newVal)
//         return;
//     if (!newVal && oldVal)
//         stopListeners();
//     else {
//         console.log("token changed, will submit listeners", newVal);
//         submitListeners()
//     }
// }, { immediate: true });
addEventListener("beforeunload", (event) => {
    console.log("Before unload - stopping listeners")
    stopListeners();
});

// setTimeout(() => stopListeners(), 10_000);


// import pwaServiceWorkerUrl from "./pwaServiceWorker.js?url";
async function startServiceWorker() {
    if (true) {
        if ('serviceWorker' in navigator) {
            // console.log("Service worker supported");
            let swPath = window.location.href.includes("localhost") ? "/app/pwaServiceWorker.js" : "/pwaServiceWorker.js";
            let result = await navigator.serviceWorker.register(swPath, {
                updateViaCache: 'none'
            })
            // get existing registrations
            let registrations = await navigator.serviceWorker.getRegistrations()
            for (let registration of registrations) {
                await registration.update();
                registration.onupdatefound = () => {
                    console.log("Service worker update found");
                };
                registration.active.addEventListener("activate", event => {
                    console.log("Service worker activated 2");
                });
            }
        }

        // if ((navigator as any).standalone !== true && 
        window.addEventListener("beforeinstallprompt", async (event: any) => {
            installPrompt.event = event;
        });

        // Detects if device is on iOS 
        const isIos = () => {
            const userAgent = window.navigator.userAgent.toLowerCase();
            return /iphone|ipad|ipod/.test(userAgent);
        }
        // Detects if device is in standalone mode
        const isInStandaloneMode = () => ('standalone' in window.navigator) && (window.navigator.standalone);

        // Checks if should display install popup notification:
        if (isIos() && !isInStandaloneMode()) {
            console.log("Show safari install prompt")
        }

        // console.log("url is", pwaServiceWorkerUrl)
    }
}
startServiceWorker();

export const installPrompt = {
    event: null as any
};

