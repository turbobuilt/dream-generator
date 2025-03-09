<!-- Display name
Dream Generator Ai Website 2
Application (client) ID
e4f41f19-1431-4567-b9f0-845b03b7c5ff
Object ID
5cdea5a1-56b2-4150-b34c-b48376ba15b8
Directory (tenant) ID
f727a841-ce4e-4d1c-92a2-6e3d81bceafe
Supported account types
All Microsoft account users
Client credentials
Add a certificate or secret
Redirect URIs
1 web, 0 spa, 0 public client
Application ID URI
Add an Application ID URI
Managed application in local directory
Dream Generator Ai Website 2 -->
<script lang="ts">
import { PublicClientApplication } from "@azure/msal-browser";


declare var apple: any;
const msalInstance = new PublicClientApplication({
    auth: {
        clientId: "e4f41f19-1431-4567-b9f0-845b03b7c5ff",
    },
});

export default {
    props: ["show","scopes"],
    components: {},
    data() {
        return {
            loggingIn: false,
            loginError: "",
            loading: false
        }
    },
    async mounted() {
        await msalInstance.initialize();
    },
    methods: {
        async showPopup() {
            try {
                this.loading = true;
                let result = await msalInstance.loginPopup({
                    redirectUri: `${window.location.origin}/app/`,
                    scopes: this.scopes,
                });
                // let response = await serverMethods.postMicrosoftLogin(result);
                // if (await showHttpErrorIfExists(response)) {
                //     return;
                // }
                this.$emit("login", result);
            } catch (e) {
                console.error(e);
            } finally {
                this.loading = false;
            }
        },
    }
}
</script>
<template>
    <div class="microsoft-login-button-container" ref="root" @click="showPopup()">
        <div class="microsoft-login-button">
            <img src="../../assets/logos/microsoft.png" alt="Microsoft Logo" style="width: 25px; height: 25px; margin-right: 5px;">
            <div v-if="!loading">Connect Active Directory (Entra) (Read Only)</div>
            <div v-else class="loading">Loading...</div>
        </div>
    </div>
</template>
<style lang="scss">
.microsoft-login-button-container {
    display: flex;
    flex-direction: column;
    // align-items: center;
    position: relative;
    width: 100%;
    .microsoft-login-button {
        height: 40px;
        outline: none;
        box-shadow: 0 0 10px rgba(0, 0, 0, .5);
        border: none;
        color: black;
        font-size: 18px;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: white;
        width: 100%;
        border-radius: 5px;
        transition: .1s background-color;
        cursor: pointer;
        &:hover {
            background-color: #f1f1f1;
        }
    }
    .loading {
        text-align: center;
        z-index: -1;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    #apple-button {
        font-size: 16px;
    }
    .error {
        padding: 10px;
        color: red;
        background: white;
        border-radius: 5px;
        padding: 5px;
        margin-top: 5px;
    }
    .sign-up-apple-button {
        width: 25px;
        border-radius: 5px;
        padding: 5px 8px;
        border: 1px solid gainsboro;
    }
}
</style>