// import ./pwaServiceWorker.ts as url
// import pwaServiceWorkerUrl from "./pwaServiceWorker.js?url";
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register("/pwaServiceWorker.js", {
        updateViaCache: 'none'
    })
    // This code executes in its own worker or thread
    self.addEventListener("install", event => {
        console.log("Service worker installed");
    });
    self.addEventListener("activate", event => {
        console.log("Service worker activated");
    });
    // get existing registrations
    navigator.serviceWorker.getRegistrations().then(async function (registrations) {
        for (let registration of registrations) {
            console.log("Service worker registration:", registration);
            let updateResult = await registration.update();
            console.log("Service worker update result:", updateResult);
        }
    });
}

console.log("working")
export const installPrompt = {
    event: null as any
};

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