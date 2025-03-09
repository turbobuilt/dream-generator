<script lang="ts">
import { loadFacebookLoginCode } from "@/lib/facebooklogin";
import FacebookLoginButton from "./FacebookLoginButton.vue";
import GoogleLoginButton from "./GoogleLoginButton.vue";
import { store } from "../store";

declare var google: any;
export default {
    props: ["show"],
    components: {
        FacebookLoginButton,
        GoogleLoginButton
    },
    data() {
        return {
            googleUser: null,
            loggingIn: false,
            loginError: ""
        }
    },
    async created() {
    },
    mounted() {
    },
    methods: {
        handleLoginResponse(data: any) {
            const { authenticatedUser, token, newUser, error, plan } = data;
            if (error) {
                this.loginError = error;
            } else {
                localStorage.setItem("token", token);
                localStorage.setItem("accountCreated", "true");
                store.authenticatedUser = authenticatedUser;
                store.authenticatedUser
                store.token = token;
                document.cookie = `token=${token};path=/`;
                this.$emit("login");
            }
        },
        goToGoogle() {
            // open a popup window
            window.open("https://accounts.google.com/signup/v2/webcreateaccount?hl=en&flowName=GlifWebSignIn&flowEntry=SignUp", "_blank");
        }
    }
}
</script>
<template>
    <div class="login-component">
        <div class="button-container">
            <GoogleLoginButton @login="handleLoginResponse" />
        </div>
        <div class="button-container">
            <FacebookLoginButton @login="handleLoginResponse" />
        </div>
        <div class="error" v-if="loginError">{{ loginError }}</div>
        <div>
            <div class="button-container">
                <button class="login-button sign-up-google-button" @click="goToGoogle()">Create Google Account</button>
            </div>
        </div>
    </div>
</template>
<style lang="scss">
.login-component {
    display: flex;
    flex-direction: column;
    align-items: center;
    .error {
        padding: 10px;
        color: red;
    }
    .button-container {
        display: flex;
        justify-content: center;
        margin-bottom: 10px;
        width: 100%;
        max-width: 300px;
    }
    .login-button {
        height: 40px;
        min-width: 250px;
        width: 100%;
    }
}
</style>