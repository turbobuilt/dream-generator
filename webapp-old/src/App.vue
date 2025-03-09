<script lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { store } from './store';
import axios from 'axios';
import LoginView from "./views/Login.vue"
import router from './router';
import RegisterModal from './components/RegisterModal/RegisterModal.vue';
import { defineComponent } from 'vue';
import { getPlans } from './lib/helpers';
import UpgradeModal from './components/UpgradeModal/UpgradeModal.vue';
import InstallButton from "./components/InstallButton.vue";

export default defineComponent({
    components: {
        RouterLink,
        RouterView,
        LoginView,
        RegisterModal,
        UpgradeModal,
        InstallButton
    },
    computed: {
        hideMenu() {
            return this.$route.name === "verifyEmail";
        }
    },
    data() {
        return {
            router,
            store: store,
            loadingUser: true,
            showMainMenu: false,
            upgradeModalCallback: null as Function | null
        }
    },
    async created() {
        await this.getAuthenticatedUser();
        if (window.location.href.match(/payment_intent=([^&])+/)) {
            this.$router.replace("/payment?" + window.location.href.split("?")[1])
        } else {
            // let path = store.basePath ? window.location.pathname : window.location.pathname.split("/app")[1];
            // console.log("path is", path);
            // this.$router.replace(path + this.$router
        }
    },
    mounted() {
        getPlans();
    },
    methods: {
        async showRegisterModal(callback) {
            store.showingRegisterOrUpgradeModal = true;
        },
        subscriptionComplete() {
            store.showingRegisterOrUpgradeModal = false;
            // this.getAuthenticatedUser();
        },
        async getAuthenticatedUser() {
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
        },
        logout() {
            localStorage.removeItem("token");
            store.authenticatedUser = null;
        },
        async openStripePortal() {
            let newWindow = window.open("about:blank", "_blank");
            let res = await axios.get("/api/get-stripe-customer-portal-link");
            newWindow.location.href = res.data.url;
        }
    }
})
</script>

<template>
    <div class="outer-container">
        <InstallButton />
        <!-- <LoginView :show="(!store.authenticatedUser || store.showLoginPage) && !store.loadingOrDisplayingImage && !loadingUser && $route.name !== 'create' && $route.name !== 'patronSignup'" /> -->
        <UpgradeModal v-if="store.showingRegisterOrUpgradeModal && store.authenticatedUser" :on-close="() => store.showingRegisterOrUpgradeModal = false" :on-subscribe="subscriptionComplete"/>
        <RegisterModal v-else-if="store.showingRegisterOrUpgradeModal" :on-subscribe="subscriptionComplete"/>
        <div class="content">
            <div v-if="loadingUser">
                <!-- Loading... -->
            </div>
            <template v-else>
                <div class="main-menu" v-if="!hideMenu">
                    <div class="menu-button" @click="showMainMenu = true">
                        Menu
                    </div>
                    <div class="links" :class="{open: showMainMenu}" @click="showMainMenu = false">
                        <!-- <a href="/">Home</a> -->
                        <!-- <router-link :to="`/feed`">Feed</router-link> -->
                        <router-link :to="`/create`">Create</router-link>
                        <!-- <router-link :to="`/edit`">Edit</router-link> -->
                        <router-link :to="`/chat`">AI Chat</router-link>
                        <router-link :to="`/history`">History</router-link>
                        <a v-if="!store.authenticatedUser" @click="showRegisterModal">Register</a>
                        <a v-if="!store.authenticatedUser" @click="showRegisterModal">Login</a>
                        <router-link :to="`/admin`" v-if="store.authenticatedUser?.email==='hdtruelson[at]gmail.com'.replace('[at]','@')">Admin</router-link>
                        <a @click="logout" v-if="store.authenticatedUser">Logout</a>
                        <v-spacer />
                        <a @click="openStripePortal()" v-if="store.authenticatedUser">{{ parseFloat(store.authenticatedUser?.creditsRemaining as any).toFixed(1) || "" }} Credits</a>
                        <!-- <router-link v-else :to="`/payment`">Setup Payment</router-link> -->
                    </div>
                </div>
                <RouterView />
            </template>
        </div>
        <div class="footer">
            <v-spacer />
            <router-link to="/credits">Credits</router-link>
        </div>
    </div>
</template>

<style lang="scss">
html * {
    box-sizing: border-box;
}
html {
    overflow: auto !important;
}
html, body, #app {
    margin: 0;
    padding: 0;
    height: 100vh;
    width: 100vw;
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
</style>
