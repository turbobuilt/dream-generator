import { store } from "@/store";
import { c } from "vite/dist/node/types.d-aGj9QkWt";
import { watch } from "vue";

export async function postToPwa(data) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => {
            registration.active.postMessage(data);
        });
    });
}


export async function subscribeToEvent(data: { type: string, data?: any, callback: (data: any) => void, guid: string }) {
    data.guid = data.guid || crypto.randomUUID();
    store.eventListeners[data.guid] = data;
    submitListeners();
    return data.guid;
}
export async function subscribeToEvents(owner, dataItems: { type: string, owner?: any, data?: any, callback: (data: any) => void, guid: string }[]) {
    for (let data of dataItems) {
        data.guid = data.guid || crypto.randomUUID();
        data.owner = owner;
        store.eventListeners[data.guid] = data;
    }
    submitListeners();
    return dataItems;
}

export async function unsubscribeFromEventType(type: string) {
    for (let guid in store.eventListeners) {
        if (store.eventListeners[guid].type === type) {
            delete store.eventListeners[guid];
        }
    }
    submitListeners();
}
export async function unsubscribeFromEventTypes(types: string[]) {
    for (let type of types) {
        for (let guid in store.eventListeners) {
            if (store.eventListeners[guid].type === type) {
                delete store.eventListeners[guid];
            }
        }
    }
    submitListeners();
}
export async function unsubscribeFromAll(owner) {
    for (let guid in store.eventListeners) {
        if (store.eventListeners[guid].owner === owner) {
            delete store.eventListeners[guid];
        }
    }
    submitListeners();
}

export async function unsubscribeFromEvent(guid: string) {
    delete store.eventListeners[guid];
    submitListeners();
}


export async function stopListeners() {
    navigator?.serviceWorker?.controller?.postMessage({
        type: 'stopListeners',
        data: {
            clientId: store.sseClientId
        }
    });
}

let swActive = false;
export async function submitListeners(patient = false) {
    if (!store.token || !navigator.serviceWorker.controller)
        return;

    if (patient && !swActive) {
        console.log('Service worker not active, will retry in 1s');
        return;
    }
    
    let registration = await navigator.serviceWorker.ready;
    swActive = true;
    navigator.serviceWorker.controller.postMessage({
        type: 'eventListeners',
        data: {
            clientId: store.sseClientId,
            token: store.token,
            eventListeners: JSON.parse(JSON.stringify(store.eventListeners, (key, value) => key === "owner" ? undefined : value))
        }
    });
}

const channel = new BroadcastChannel('notifications');
channel.onmessage = function (event) {
    console.log("received broadcast", event.data);
    let data = event.data as {
        data: any,
        event: string,
        eventListener: { guid: string, type: string },
        from: string
    }

    // look for applicable event listeners
    let localEventListener = store.eventListeners[data.eventListener.guid];
    if (localEventListener) {
        localEventListener.callback(data);
    } else {
        // console.error("no local event listener for", data);
    }
};
