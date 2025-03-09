///@ts-check
// 
if (typeof crypto === "undefined") {
    // @ts-ignore
    var crypto = {}
}

if (!crypto.randomUUID) {
    // @ts-ignore
    crypto.randomUUID = function () {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    console.log("random uuid", crypto.randomUUID())
}

const sseNotificationsUrl = "/api/post-subscribe-to-notifications";
const eventsOrigin = self.location.hostname === "localhost" ? self.location.origin : "https://live.dreamgenerator.ai";
const eventSourceUrl = eventsOrigin + sseNotificationsUrl;


//@ts-ignore
self.addEventListener("fetch", event => handleFetch(event));

const cacheName = "mainCache";
const currentOrigin = self.location.origin;

let lastFetchedAll = null;

// jsdoc
/**
 * @param {any} event
 */
function handleFetch(event) {
    if (!lastFetchedAll) {
        lastFetchedAll = Date.now();
        updateAllCache();
    }
    if (event.request.url.includes("dreamgenerator.ai") === false) {
        return;
    }

    if (event.request.method !== "GET") {
        // console.log("not get request", event.request.url)
        return;
    }
    if (event.request.url.match(/localhost/)) {
        return;
    }
    // if it doesn't start with http, don't cache
    if (event.request.url.startsWith("http") === false) {
        return;
    }
    let offlineFile = getOfflineFiles();
    let urlPath = new URL(event.request.url).pathname;
    if (!offlineFile.files[urlPath]) {
        return
    }

    return event.respondWith(new Promise(async function (resolve, reject) {
        let cache = await caches.open(cacheName);
        let result = await cache.match(event.request);
        if (result) {
            return resolve(result);
        }
        return resolve(fetch(event.request));
    }));
}


function parseSSEMessage(message) {
    const lines = message.split('\n');
    let event = null;
    let data = '';

    for (const line of lines) {
        if (line.startsWith('event:')) {
            event = line.slice(6).trim();
        } else if (line.startsWith('data:')) {
            data += line.slice(5).trim() + '\n';
        }
    }

    return { event, data: data.trim() };
}


class EventSourceConnection {
    constructor({ token, events, onMessage, onConnected, onError }) {
        this.created = Date.now();
        this.token = token;
        this.onError = onError;
        this.onMessage = onMessage;
        this.onConnected = onConnected;
        this.controller = new AbortController();
        this.events = events;
        let headers = {};
        headers["Accept"] = "text/event-stream";
        console.log("token", this.token);
        headers["authorizationtoken"] = `${this.token}`;
        headers["Content-Type"] = "application/json";
        this.options = {};
        this.options.headers = headers;
        this.eventSource = null;
    }

    async kill() {
        try {
            this.onError = () => { };
            this.controller.abort();
        } catch (err) { }
    }

    async connect() {
        console.log("Sending pwa connection message to server.")
        try {
            let response = await fetch(eventSourceUrl, {
                method: "POST",
                body: JSON.stringify({ events: this.events }),
                signal: this.controller.signal,
                credentials: "same-origin",
                ...this.options
            })
            console.log("pwa got initial response from server")
            if (!response) {
                console.error("pwa response is null")
                this.onError("err - no response");
                return;
            }
            if (!response.ok) {
                var body = "";
                try {
                    body = await response.text();
                } catch (err) {
                    console.error("pwa error response.text doesn't work")
                }
                console.error("pwa error connecting to server")
                this.onError("err - not ok " + response.status + " " + body);
                return;
            }
            if (!response.body) {
                console.error("pwa error connecting to server")
                this.onError("err - no body");
                return;
            }
            console.log("Decoding response")
            const decoder = new TextDecoder();
            let reader = response.body.getReader();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                console.log("Got buffer");

                let boundary = buffer.indexOf('\n\n');
                let i = 0;
                while (boundary !== -1) {
                    if (i++ > 10_000) {
                        console.error("pwa - breaking - sse message greater than 10kb");
                        break;
                    }
                    const message = buffer.slice(0, boundary).trim();
                    buffer = buffer.slice(boundary + 2);

                    const event = parseSSEMessage(message);
                    console.log("got sse", event);
                    if (event.event === "connected") {
                        this.onConnected();
                    } else {
                        this.onMessage(JSON.parse(event.data));
                    }
                    boundary = buffer.indexOf('\n\n');
                }
                await new Promise(resolve => setTimeout(resolve, 1))
                console.log("looping")
            }


            // let buffer = '';
            // for await (let chunk of response.body) {
            //     buffer += decoder.decode(chunk, { stream: true });
            //     console.log("Got buffer")
            //     let boundary = buffer.indexOf('\n\n');
            //     let i = 0;
            //     while (boundary !== -1) {
            //         if (i++ > 10_000) {
            //             console.log("breaking");
            //             break;
            //         }
            //         const message = buffer.slice(0, boundary).trim();
            //         buffer = buffer.slice(boundary + 2);

            //         const event = parseSSEMessage(message);
            //         console.log("got sse", event);
            //         if (event.event === "connected") {
            //             this.onConnected();
            //         } else {
            //             this.onMessage(JSON.parse(event.data));
            //         }
            //         boundary = buffer.indexOf('\n\n');
            //     }
            // }
        } catch (err) {
            if (err.name === "AbortError")
                return;
            console.error("pwa error decoding body", err);
            try {
                this.controller.abort()
            } catch (err) { }
            this.onError(err);
        }
    }
}


/**
 * Event Source
 */
// this class uses "fetch" instead of EventSource, and sets the authorization header
// in the event of failed http request, timeout, or disconnect
const retryDelay = 5_000;
const connectionLife = 20_000;
class MyEventSource {
    constructor() {
        this.id = crypto.randomUUID();
        this.messages = {};
        this.options = {};
        this.lastConnection = 0;
        this.lastTokenRefresh = Date.now();
        this.eventSource = null;
        this.timeout = null;
        this.controller = new AbortController();
        this.events = {};
        this.scheduledConnection = null;
    }

    async scheduleConnection(millis) {
        console.log("scheduling connection", "current connection", this.scheduledConnection, "This id", this.id);
        if (this.scheduledConnection) {
            console.log("clearing old scheduled connection", this.scheduledConnection);
            clearTimeout(this.scheduledConnection.timeout);
        }
        this.scheduledConnection = {
            timeout: setTimeout(() => {
                this.scheduledConnection = null;
                this.connect();
            }, connectionLife),
            occursAt: Date.now() + millis
        }
    }

    async stop() {
        if (this.eventSource) {
            this.eventSource.kill();
        }
        if (this.scheduledConnection) {
            clearTimeout(this.scheduledConnection.timeout);
        }
        for (let key in this.events) {
            // if (key !== this.clientId) {
            //     delete this.events[key];
            // }
        }
    }

    async connect() {
        // make sure clients exists
        // @ts-ignore
        const clients = await self.clients.matchAll();
        console.log("connencting to sse")
        if (clients.length === 0) {
            console.log("no clients, quitting");
            this.stop();
            return;
        }

        console.log("connecting", new Date().toISOString(), "this id", this.id);
        this.scheduleConnection(connectionLife);
        let newEventSourceConnection = new EventSourceConnection({
            token: this.token,
            events: this.events,
            onConnected: () => {
                console.log("sse event listener connected", JSON.stringify(this.eventSource));
                if (this.eventSource) {
                    console.log("aborting old connection");
                    this.eventSource.controller.abort();
                }
                this.eventSource = newEventSourceConnection;
            },
            onMessage: (data) => {
                console.log("Got pwa message", data)
                this.onMessage(data);
            },
            onError: (err) => {
                if (err.name === "AbortError" && this.scheduledConnection)
                    return;
                // if there is another connection scheduled, and it will happen with in the next retryDelay milliseconds, leave it alone
                if (this.scheduledConnection && this.scheduledConnection.occursAt < Date.now() + retryDelay) {
                    console.log("reconnect already scheduled");
                    return;
                } else {
                    console.log(`will reconnect in ${retryDelay / 1000} seconds`);
                    this.scheduleConnection(retryDelay);
                }
            }
        })
        newEventSourceConnection.connect();
    }

    onMessage(data) {
        this.clearOldMessages();
        console.log("message", data);
        let { event, eventListener } = data;
        // check if message has already been processed
        // if (this.messages[data.guid]) {
        //     console.log("message already processed", data.guid);
        //     return;
        // }
        // this.messages[data.guid] = {
        //     created: Date.now(),
        //     data
        // }
        if (data.inResponseTo) {
            if (this.events[data.inResponseTo]) {
                this.events[data.inResponseTo].handler(data);
            }
        } else {
            const notificationChannel = new BroadcastChannel('notifications');
            notificationChannel.postMessage(data);
        }
    }

    clearOldMessages() {
        // clear messages older than 30 seconds
        for (let key in this.messages) {
            if (this.messages[key].created < Date.now() - 30_000) {
                delete this.messages[key];
            }
        }
    }

    removeClient(clientId) {
        console.log("removing client", clientId);
        delete this.events[clientId];
        if (Object.keys(this.events).length === 0) {
            if (this.scheduledConnection) {
                clearTimeout(this.scheduledConnection.timeout);
            }
            if (this.eventSource) {
                this.eventSource.kill();
            }
            return true;
        } else {
            this.connect();
            return false;
        }
    }

    updateEvents(data) {
        console.log("will update events", JSON.stringify(this.events));
        this.token = data.token;
        console.log("updating events", data);
        this.events[data.clientId] = data;
        this.connect();
    }
}

/** @type {MyEventSource?} */
var sseNotifications = null;

async function updateAllCache() {
    setTimeout(async () => {
        console.log("updating all cache");
        let files = getOfflineFiles().files;
        let cache = await caches.open(cacheName);
        let promises = [];
        for (let file in files) {
            let targetPath = typeof files[file] === "boolean" ? file : files[file];
            let url = origin + targetPath;
            // if key exists and it's an image, don't cache
            let existing = await cache.match(url);
            if (existing) {
                if (existing.url.match(/\.(png|jpg|jpeg|gif|webp|svg|ico|bmp|tiff|avif|hief)$/)) {
                    continue;
                }
                // if url contains /assets/, don't cache
                if (existing.url.includes("/assets/")) {
                    continue;
                }
            }
            promises.push(cache.add(url));
        }
        // clear all items in cache that are not in files
        let cacheKeys = await cache.keys();
        let cacheKeysUrls = cacheKeys.map(key => key.url);
        let toDelete = cacheKeysUrls.filter(url => !files[url]);
        for (let url of toDelete) {
            cache.delete(url);
        }
    }, 1000);
}

self.addEventListener("message", function (event) {
    console.log("pwa got message", event);
    if (event.data?.type === 'eventListeners') {
        console.log("starting eventListeners", event.data.data);
        if (!sseNotifications) {
            console.log("creating new sseNotifications");
            sseNotifications = new MyEventSource();
        } else {
            console.log("updating sseNotifications");
        }
        sseNotifications.updateEvents(event.data.data);
    } else if (event.data?.type === 'stopListeners') {
        // console.log("stopping eventListeners", event.data.data);
        if (sseNotifications) {
            sseNotifications.removeClient(event.data.data.clientId)
        }
    }
});

// skip waiting
self.addEventListener("install", function (event) {
    //@ts-ignore
    self.skipWaiting();
});
self.addEventListener("activate", (event) => {
    //@ts-ignore
    event.waitUntil(clients.claim());
});
// self.addEventListener('statechange', (event) => {
//     console.log('Service Worker State Change:', event);    
//     if (event.target?.state === 'redundant') {
//       console.log('Service worker has been superseded and is now redundant.');
//       // Perform any cleanup or shutdown operations here
//     }
// });

function getOfflineFiles() {
	return {
  "files": {
    "/app/favicon.ico": true,
    "/app/screenshots/iphone_max/1.avif": true,
    "/app/screenshots/iphone_max/3.avif": true,
    "/app/index.html": true,
    "/app/rocket.avif": true,
    "/app/apple-touch-icon.png": true,
    "/app/logos/logo_192x192.png": true,
    "/app/logos/logo_512x512.png": true,
    "/app/logo.png": true,
    "/app/apple-touch-startup-image/apple_splash_750.png": true,
    "/app/apple-touch-startup-image/apple_splash_1536.png": true,
    "/app/apple-touch-startup-image/apple_splash_1668.png": true,
    "/app/apple-touch-startup-image/apple_splash_1125.png": true,
    "/app/apple-touch-startup-image/apple_splash_1242.png": true,
    "/app/apple-touch-startup-image/apple_splash_2048.png": true,
    "/app/apple-touch-startup-image/apple_splash_640.png": true,
    "/app/logo.avif": true,
    "/app/manifest.json": true,
    "/app/payment-method-icons/elo.svg": true,
    "/app/payment-method-icons/hipercard.svg": true,
    "/app/payment-method-icons/visa.svg": true,
    "/app/payment-method-icons/maestro.svg": true,
    "/app/payment-method-icons/diners.svg": true,
    "/app/payment-method-icons/discover.svg": true,
    "/app/payment-method-icons/code.svg": true,
    "/app/payment-method-icons/paypal.svg": true,
    "/app/payment-method-icons/unionpay.svg": true,
    "/app/payment-method-icons/mastercard.svg": true,
    "/app/payment-method-icons/mir.svg": true,
    "/app/payment-method-icons/amex.svg": true,
    "/app/payment-method-icons/jcb.svg": true,
    "/app/payment-method-icons/hiper.svg": true,
    "/app/payment-method-icons/alipay.svg": true,
    "/app/payment-method-icons/generic.svg": true,
    "/app/payment-method-icons/code-front.svg": true,
    "/app/robots.txt": true,
    "/app/assets/3d-model-qQnLUhMl.avif": true,
    "/app/assets/anime-rDVkynoh.avif": true,
    "/app/assets/avif_enc_mt-Di0rVKC7.js": true,
    "/app/assets/AutomailerEmailPage-VwGPUwE-.css": true,
    "/app/assets/ModeratePage-C_DVWUqS.js": true,
    "/app/assets/OrganizationPage-C7qa3ZYR.css": true,
    "/app/assets/avif_enc-BnarrZ9J.wasm": true,
    "/app/assets/avif_enc_mt.worker-BEMqqgZa.js": true,
    "/app/assets/avif_enc_mt-DS1m7BJk.wasm": true,
    "/app/assets/avif_enc-CSJ-NYrO.js": true,
    "/app/assets/avif_enc_mt-DCLppEmh.js": true,
    "/app/assets/digital-art-Nzf2mEZ8.avif": true,
    "/app/assets/photorealistic-Bf5oZjtg.avif": true,
    "/app/assets/logo-tdFxN8EC.avif": true,
    "/app/assets/AutomailerEmailPage-BDdhoIAL.js": true,
    "/app/assets/ModeratePage-CVdrVKDb.css": true,
    "/app/assets/fantasy-art-BaspLnFm.avif": true,
    "/app/assets/AutomailerPage-BY-E-WvQ.css": true,
    "/app/assets/lion-NURzdH6e.avif": true,
    "/app/assets/MenuPage-CShxmBEU.js": true,
    "/app/assets/galaxy_big-Dsk9V_op.avif": true,
    "/app/assets/index-C0_mxf4O.css": true,
    "/app/assets/index-Dy1iJpWl.js": true,
    "/app/assets/MenuPage-DmOW1V1t.css": true,
    "/app/assets/171-Cp2yXrLg.avif": true,
    "/app/assets/AutomailerPage-DTFSev8A.js": true,
    "/app/assets/avif_dec-3FkjLu3p.wasm": true,
    "/app/assets/OrganizationPage-BeLHwz1g.js": true,
    "/app/assets/179-BBW0Kxip.avif": true,
    "/app/assets/AutomailersListPage-BbXKVqzN.js": true,
    "/app/assets/AutomailersListPage-DrIdsZ91.css": true,
    "/app/pwaServiceWorker.js": true,
    "/app/share/prompt/default.html": true,
    "/app/": "/app/",
    "/app/login": "/app/",
    "/app/advanced-create": "/app/",
    "/app/advanced-history": "/app/",
    "/app/start-trial": "/app/",
    "/app/payment": "/app/",
    "/app/text-to-speech": "/app/",
    "/app/ai-chat": "/app/",
    "/app/edit-image": "/app/",
    "/app/remove-background": "/app/",
    "/app/people": "/app/",
    "/app/profile/:username": "/app/",
    "/app/feed": "/app/",
    "/app/share/:id": "/app/",
    "/app/chat": "/app/",
    "/app/my-shares": "/app/",
    "/app/account": "/app/",
    "/app/my-profile": "/app/",
    "/app/terms": "/app/",
    "/app/privacy": "/app/",
    "/app/organization/:id": "/app/",
    "/app/admin": "/app/",
    "/app/admin/moderate": "/app/",
    "/app/admin/automailer": "/app/",
    "/app/admin/automailer/:id": "/app/",
    "/app/admin/automailer-email/:id": "/app/",
    "/app/delete": "/app/"
  }
};
}