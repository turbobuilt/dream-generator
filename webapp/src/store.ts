import { computed, reactive } from "vue"
import { ImageInProgress, ImagePromptInProgress as ImageGenerationRequest } from "./pages/create/createImage"
import { SavedImageData } from "./lib/imageSave";
import { CreateImageRequestSettings } from "./serverModels/CreateImageRequestSettings";
import { ClientShare, Share } from "./serverModels/Share";
import { c } from "vite/dist/node/types.d-aGj9QkWt";
// uuid v4
import { v4 as uuidv4 } from 'uuid';


var stripeLoaded = false;
let testKey = "pk_test_51JEIXQKQlgzQQuyipmwUlPksGPQKUTJfMIiWm25ny4z4pPnugXxCcqgHoU2zfrbFmrIqVHDJGy5tfuZ4VId0uWV700LGvwkDa8";
let liveKey = "pk_live_51JEIXQKQlgzQQuyifh0i96DauOzly8XZO7WRAd2CFQdASW3njxxdaojxbeojdBudrSNmaPxJPZwQCvIujEdiVEc5008GlrLMh2";
export const store = reactive(makeStore());


function makeStore() {
    return {
        isSafari: /^((?!chrome|android).)*safari/i.test(navigator.userAgent),
        authenticatedUser: null as AuthenticatedUser,
        token: null as string,
        isTest: window.location.host === "dreamgenerator.ai" ? false : true,
        showLoginPage: false,
        currentImage: null as any,
        loadingOrDisplayingImage: false,
        isMobile: checkIsMobile(),
        baseImagePath: "https://images.dreamgenerator.ai/",
        avifLoaded: false,
        avifLoading: false,
        wantsToBePatron: false,
        basePath: window.location.href.indexOf("localhost") > -1 ? "/app" : "",
        showingRegisterOrUpgradeModal: false,
        mainTransition: null,
        checkingAuthentication: true,
        plans: null as { appleId: string, credits: number, id: string, name: string, price: number, stripeId: string }[],
        imageGenerationRequests: [] as ImageGenerationRequest[],
        pollImageStatusTimer: null,
        showingFreeLimitReachedModal: false,
        stripePublicToken: window.location.href.indexOf("dreamgenerator") > -1 ? liveKey : testKey,
        bottomDisplayInfo: [] as any,
        paymentIntent: null as string,
        publishingImage: false,
        imagePollingError: "",
        imageRequestSettings: new CreateImageRequestSettings() as CreateImageRequestSettings, // new CreateImageRequestSettings(),
        images: [] as SavedImageData[],
        selectedEditImageFiles: null as File,
        feedViewItems: [] as ClientShare[],
        myShares: [],
        navStack: [],
        isApp: false,
        selectedPlan: null as { appleId: string, credits: number, id: string, name: string, price: number, stripeId: string },
        showingUpgradeModal: false,
        showingStripeModal: false,
        imageGenerationModels: [],
        sseClientId: uuidv4(),
        currentVideoChat: null as {
            recipients: number[],
            callRoom: { id: number, name: string, uuid: string, originator: string },
            originator?: { userName, id }
            active?: boolean
        },
        eventListeners: {} as {
            [id: string]: { type: string, owner?: any, data?: any, callback: (data: any) => void }
        },
        onChatMessageReceived: null as (data: any) => void,
        // lastTokenSentToSse: null as string,
    }
}
console.log(makeStore().isSafari, "Was safari")
// listen for changes to localStorage authtoken
window.addEventListener("storage", (event) => {
    if (event.key === "token" && event.newValue && event.newValue !== store.token) {
        store.token = event.newValue;
    }
});

const broadcastChannel = new BroadcastChannel("notifications");
broadcastChannel.addEventListener("message", (event) => {
    console.log("broadcast message", event.data);
});

function checkIsMobile() {
    return window.innerWidth < 768;
}
// on resize, check is mobile
window.addEventListener("resize", () => {
    store.isMobile = checkIsMobile();
})


export const loadingGroup = computed(() => {
    for (let group of store.imageGenerationRequests) {
        if (group.isEdit)
            continue;
        for (let image of group.items) {
            if (!image.complete) {
                return group;
            }
        }
    }
    return null;
});

export const nav = {
    replace: (componentFn: () => any) => {
        if (store.navStack.length === 0) {
            store.navStack.push(componentFn);
        } else {
            store.navStack[store.navStack.length - 1] = componentFn;
        }
    },
    pop: () => {
        store.navStack.pop();
    }
}


export const currentPlan = computed(() => {
    if (!store.authenticatedUser?.plan || !store.plans) return null;
    return store.plans.find(p => p.id === store.authenticatedUser.plan);
})

export interface AuthenticatedUser {
    id: number;
    email: string;
    name: string;
    provider: string;
    providerData: string;
    creditsRemaining: number;
    created: number;
    updated: number;
    createdBy: number;
    updatedBy: number;

    agreesToTerms: boolean;
    plan: string;
    understandsPublishCommitment: boolean;
    pushToken: string;
    autoPublish: boolean;
    userName: string;
    shareEmail: string;
    expandedContent: any;
}
// import router from "./router";
export async function logout() {
    let { plans } = store;
    let newStore = makeStore();
    newStore.plans = plans;
    newStore.checkingAuthentication = false;

    for (let key in store) {
        if (newStore[key] === undefined) {
            delete store[key];
        }
    }
    for (let key in newStore) {
        store[key] = newStore[key]
    }
    localStorage.removeItem("token");
    console.log("logged out", store);
    const router = await import("./router");
    router.default.replace("/");
    // router.replace("/login");
}