<script lang="ts" setup>
import { RouterLink, RouterView } from 'vue-router'
import { store, logout } from './store';
import axios from 'axios';
import LoginView from "./views/Login.vue"
import router from './router';
import RegisterModal from './components/RegisterModal/RegisterModal.vue';
import { defineComponent, onMounted, reactive } from 'vue';
import { getPlans } from './lib/helpers';
// import UpgradeModal from './components/UpgradeModal/UpgradeModal.vue';
import InstallButton from "./components/InstallButton.vue";
import Header from "./layout-components/Header.vue";
import FreeLimitReached from "./modals/FreeLimitReached.vue";
import BottomDisplay from "./ui-elements/BottomDisplay.vue";
import Menu from './sections/Menu.vue';
import ProcessPayment from './modals/ProcessPayment.vue';
import DisplayImageResults from './pages/create/components/DisplayImageResults.vue';
import { computed } from 'vue';
import NavItem from './ui-elements/NavItem.vue';
import NavRender from './ui-elements/NavRender/NavRender.vue';
import { openStripePortal } from './lib/stripe';
import PaymentModal from './pages/payment/PaymentModal.vue';
import Features from './pages/payment/Features.vue';
import Checkout from './sections/checkout/Checkout.vue';
import OutOfCredits from './modals/OutOfCredits.vue';
import StripeCheckout from './sections/checkout/StripeCheckout.vue';
import Login from './pages/login/Login.vue';
import VideoCallReceiver from './pages/authenticated-user-profile/components/VideoCallReceiver.vue';
import VideoChat from './pages/video-chat/VideoChat.vue';

router.afterEach((to, from) => {
    // console.log(to, from);
    // detect which comes first
    let routes = router.getRoutes();
    if (routes.indexOf(to.matched[0]) < routes.indexOf(from.matched[0])) {
        store.mainTransition = "swipe-backward";
    } else {
        store.mainTransition = "swipe-forward";
    }
    // store.mainTransition = history.state.forward ? "swipe-backward" : "swipe-forward";
})


// if (window.visualViewport) {
//     const vv = window.visualViewport;
//     function fixPosition() {
//         document.querySelector("body").style.height = `${vv.height}px`;
//     }
//     vv.addEventListener('resize', fixPosition);
//     fixPosition(); // Make sure we call it once before resizing too
// }


const hideMenu = computed(() => {
    return router.currentRoute.value.name === "verifyEmail";
});
const d = reactive({
    router,
    store: store,
    loadingUser: true,
    showMainMenu: false,
    upgradeModalCallback: null as Function | null
});
// onCreated(async () => {
// });
onMounted(async () => {
    // await getAuthenticatedUser();
    getPlans();
    checkPaymentSuccess();
});

async function checkPaymentSuccess() {
    await router.isReady();
    let paymentIntent = window.location.href.match(/payment_intent=([^&]+)/);
    if (paymentIntent) {
        store.paymentIntent = paymentIntent[1];
    }
}
async function showRegisterModal(callback) {
    store.showingRegisterOrUpgradeModal = true;
}
function subscriptionComplete() {
    store.showingRegisterOrUpgradeModal = false;
    // this.getAuthenticatedUser();
}
async function getAuthenticatedUser() {
    try {
        this.loadingUser = true;
        store.token = localStorage.getItem("token");
        let res = await axios.get("/api/authenticated-user");
        store.authenticatedUser = res.data.authenticatedUser;
    } catch (err) {
        store.authenticatedUser = null;
        console.error(err);
    } finally {
        this.loadingUser = false;
    }
}

let touchPos = null;
let touchStart = null;
function touchStarted(e) {
    touchStart = e.touches[0].clientY;
    touchPos = touchStart;
}
function touchMoved(e) {
    touchPos = e.touches[0].clientY;
}
function touchEnded(e) {
    if (touchPos - touchStart > 100) {
        this.showMainMenu = true;
    } else {
        this.showMainMenu = false;
    }
}
function touchCanceled(e) {
    this.showMainMenu = false;
}

//@touchstart="touchStarted" @touchmove="touchMoved" @touchend="touchEnded" @touchcancel="touchCanceled"
</script>

<template>
    <div class="outer-container">
        <Header v-if="store.authenticatedUser" />
        <VideoChat />
         
        <!-- <InstallButton /> -->
        <!-- <UpgradeModal v-if="store.showingRegisterOrUpgradeModal && store.authenticatedUser" :on-close="() => store.showingRegisterOrUpgradeModal = false" :on-subscribe="subscriptionComplete" />
        <RegisterModal v-else-if="store.showingRegisterOrUpgradeModal" :on-subscribe="subscriptionComplete" /> -->
        <FreeLimitReached v-model="store.showingFreeLimitReachedModal" />
        <ProcessPayment :payment-intent="store.paymentIntent" />
        <DisplayImageResults />
        <NavRender />
        <OutOfCredits />
        <bottom-sheet v-model="store.showingStripeModal" :min-height="50" max-height="95%">
            <StripeCheckout :plan="store.selectedPlan" @close="store.showingStripeModal = false" />
        </bottom-sheet>
        <bottom-sheet :modelValue="!store.authenticatedUser && router.currentRoute.value.fullPath !== '/login' && !store.checkingAuthentication" min-height="80%" max-height="95%" :preventClose="true" >
            <Login />
        </bottom-sheet>
        <div class="content">
            <div v-if="store.checkingAuthentication">
                <!-- Loading... -->
            </div>
            <template v-else>
                <div class="main-menu" v-if="!hideMenu">
                    <div class="menu-button" @click="d.showMainMenu = true">
                        Menu
                    </div>
                    <div class="links" :class="{ open: d.showMainMenu }" @click="d.showMainMenu = false">
                        <!-- <a href="/">Home</a> -->
                        <!-- <router-link :to="`/feed`">Feed</router-link> -->
                        <router-link :to="`/advanced-create`">Create</router-link>
                        <!-- <router-link :to="`/edit`">Edit</router-link> -->
                        <router-link :to="`/ai-chat`">AI Chat</router-link>
                        <router-link :to="`/advanced-history`">History</router-link>
                        <a v-if="!store.authenticatedUser" @click="showRegisterModal">Register</a>
                        <a v-if="!store.authenticatedUser" @click="showRegisterModal">Login</a>
                        <router-link :to="`/admin`" v-if="store.authenticatedUser?.email === 'hdtruelson[at]gmail.com'.replace('[at]', '@')">Admin</router-link>
                        <a @click="logout" v-if="store.authenticatedUser">Logout</a>
                        <v-spacer />
                        <a v-if="store.authenticatedUser">{{ parseFloat(store.authenticatedUser?.creditsRemaining as any).toFixed(1) || "" }} Credits</a>
                        <!-- <router-link v-else :to="`/payment`">Setup Payment</router-link> -->
                    </div>
                </div>
                <div class="page-content">
                    <router-view v-slot="{ Component }">
                        <transition :name="store.mainTransition">
                            <keep-alive>
                                <component :is="Component" />
                            </keep-alive>
                        </transition>
                    </router-view>
                </div>
            </template>
        </div>
        <Transition name="fade" v-if="store.authenticatedUser && !router.currentRoute.value?.meta?.hideMenu">
            <div class="bottom">
                <Menu />
            </div>
        </Transition>
    </div>
</template>

<style lang="scss">
@import "./scss/animations.scss";
@import '@/scss/variables.scss';
h1 {
    font-weight: normal;
    font-size: 22px;
    margin-bottom: 5px;
}
.bottom {
    // position: absolute;
    // bottom: 0;
    // left: 0;
    // right: 0;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    background: white;
}
.page-content {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    position: relative;
    flex-shrink: 1;
    min-height: 0;
    >* {
        flex-grow: 1;
        flex-shrink: 1;
        display: flex;
        flex-direction: column;
        min-height: 0;
    }
}
html * {
    box-sizing: border-box;
}
html {}
body {
    position: fixed;
    overflow: hidden;
    margin: 0;
    padding: 0;
    top: 0;
    height: 100%;
    left: 0;
    right: 0;
}
// html, body, #app {
//     -webkit-overflow-scrolling : touch !important;
//     overflow: auto !important;
//     height: 100% !important;
// }
body, #app {}
html, body, #app {
    overscroll-behavior: none;
}
#app {
    height: 100%;
}
button.cancel {
    font-size: 14px;
    padding: 3px 7px;
    // border: 2px solid rgb(33, 150, 243);
    background: rgb(77, 77, 77);
    border-radius: 5px;
    color: white;
    text-transform: lowercase;
    cursor: pointer;
}
iframe {
    border: none;
}
button.primary {
    font-size: 15px;
    padding: 10px 20px;
    border: 2px solid rgb(33, 150, 243);
    background: rgb(77, 77, 77);
    border-radius: 5px;
    color: white;
    text-transform: uppercase;
    cursor: pointer;
}
.v-spacer {
    flex-grow: 1;
}
html .v-card {
    overflow: auto;
}
.outer-container {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    >.content {
        flex-grow: 1;
        background: white;
        min-height: 0;
        flex-shrink: 1;
        display: flex;
        flex-direction: column;
    }
    >.footer {
        display: flex;
        padding: 10px;
        font-size: 14px;
        align-items: center;
        background: gainsboro;
        a, a:visited {
            color: black;
        }
    }
}
.main-menu {
    flex-shrink: 0;
    height: 3rem;
    background-color: #eee;
    border-bottom: 1px solid #ccc;
    display: flex;
    align-items: center;
    .links {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: stretch;
    }
    // justify-content: space-between;
    a {
        cursor: pointer;
        display: flex;
        align-items: center;
        padding: 1rem;
        text-decoration: none;
        color: black;
        transition: .1s all;
        &:hover {
            background-color: white;
            color: black;
        }
    }
    .menu-button {
        display: none;
        cursor: pointer;
    }
    @media (max-width: 768px) {
        .menu-button {
            display: flex;
            align-items: center;
            padding: 0 1rem;
        }
        .links {
            position: fixed;
            top: 0;
            bottom: 0;
            left: 0;
            right: 0;
            z-index: -1;
            opacity: 0;
            transition: .2s opacity;
            &.open {
                z-index: 100;
                opacity: 1;
            }
            flex-direction: column;
            background-color: #eee;
            border-bottom: 1px solid #ccc;
            a {
                padding: 1rem;
                border-bottom: 1px solid #ccc;
            }
        }
    }
}

.simple-button {
    text-decoration: none;
    display: inline-flex;
    line-height: 1;
    padding: 5px;
    border-radius: 3px;
    background: $primary;
    color: white;
    cursor: pointer;
    margin-left: 10px;
    user-select: none;
    font-weight: normal;
    font-size: 14px;
    &:hover {
        background: darken($primary, 10%);
    }
}
</style>
