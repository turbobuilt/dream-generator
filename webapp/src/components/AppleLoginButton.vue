<script lang="ts">
import FacebookLoginButton from "./FacebookLoginButton.vue";
import { store } from "../store";
import { showAlert, showConfirm, showPrompt } from '@/ui-elements/ShowModal/showModal';
import { serverMethods } from '@/serverMethods';
import { showHttpErrorIfExists } from '@/lib/handleHttpError';

declare var apple: any;
export default {
    props: ["show"],
    components: {},
    data() {
        return {
            appleUser: null,
            loggingIn: false,
            loginError: ""
        }
    },
    mounted() {
        console.log("mounted apple login button");
        // check if apple-button exists first
        if (document.getElementById("apple-button")) {
            console.log("already made button");
            this.initAppleSignin();
            return;
        } else {
        }
        console.log("init apple sign in");
        let script = document.createElement("script");
        //set id for button
        script.id = "apple-button";
        script.onload = () => {
            console.log("loaded apple sign in");
            this.initAppleSignin();
        }
        script.src = "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js";
        document.head.appendChild(script);
    },
    // before removing component get rid of script
    // beforeUnmount() {
    //     let script = document.getElementById("apple-button");
    //     if (script) {
    //         script.remove();
    //     }
    // },
    beforeUnmount() {
        document.removeEventListener('AppleIDSignInOnSuccess', this.appleSignInSuccess);
        document.removeEventListener('AppleIDSignInOnFailure', this.appleSignInFailure);
    },
    methods: {
        async initAppleSignin() {
            console.log("apple sign in inited");
            document.addEventListener('AppleIDSignInOnSuccess', this.appleSignInSuccess);
            document.addEventListener('AppleIDSignInOnFailure', this.appleSignInFailure);

            (window as any).AppleID.auth.init({
                clientId: 'ai.dreamgenerator',
                scope: 'name email',
                redirectURI: 'https://dreamgenerator.ai/app/',
                state: Math.random().toString(),
                nonce: Math.random.toString(),
                usePopup: true
            });
        },
        async appleSignInSuccess(event) {
            console.log("apple sign in success", event, JSON.stringify(event.detail));
            let result = await serverMethods.postSubmitAppleWebLogin({ appleLoginData: event.detail });
            if (await showHttpErrorIfExists(result)) {
                return;
            }
            this.$emit("login", result);
        },
        appleSignInFailure(event) {
            if (event?.detail?.error === "popup_closed_by_user")
                return;
            showAlert({ title: "Error", content: "Apple login failed. " + event?.detail?.error });
            console.log(event.detail.error);
        },
    }
}
</script>
<template>
    <div class="apple-login-button-container" ref="root">
        <div id="appleid-signin" data-color="black" data-border="true" data-type="sign in"></div>
        <div class="error" v-if="loginError">{{ loginError }}</div>
    </div>
</template>
<style lang="scss">
.apple-login-button-container {
    display: flex;
    flex-direction: column;
    // align-items: center;
    position: relative;
    width: 100%;
    #appleid-signin {
        height: 40px;
    }
    svg {
        margin-right: 9px;
    }
    #component-apple-button {
        // z-index: -1;
        // position: fixed;
        // opacity: 0;
    }
    .apple-login-button {
        outline: none;
        box-shadow: 0 0 10px rgba(0, 0, 0, .5);
        border: none;
        color: black;
        // font-weight: bold;
        font-size: 18px;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: white;
        width: 100%;
        min-height: 45px;
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