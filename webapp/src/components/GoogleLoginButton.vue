<script lang="ts">
import FacebookLoginButton from "./FacebookLoginButton.vue";
import { store } from "../store";

declare var google: any;
export default {
    props: ["show"],
    components: {},
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
        let interval = setInterval(() => {
            if (typeof google !== 'undefined') {
                clearInterval(interval);
                this.$nextTick(() => {
                    this.initGoogleSignin();
                });
            }
        }, 500);
    },
    methods: {
        initGoogleSignin() {
            console.log("initing google sign in")
            google.accounts.id.initialize({
                client_id: "790316791498-utie09qvamofv7put3tfbgltjnkghrjk.apps.googleusercontent.com",
                callback: this.handleCredentialResponse, // callback function
            });
            let size = this.$el.closest(".login-buttons").clientWidth;
            google.accounts.id.renderButton(
                document.getElementById("component-google-button"),
                {
                    size: "large",
                    'longtitle': true,
                    'theme': 'outline',
                    width: size,
                }
            );
        },
        async startGoogleSignIn() {
            console.log("starting google sign in")
            // google.accounts.id.prompt();
            console.log(this.$refs.realGoogleButton);
            console.log(this.$refs.realGoogleButton.querySelector('div[role=button]'), "was button");
            this.$refs.realGoogleButton.querySelector('div[role=button]').click();
        },
        async handleCredentialResponse(response: any) {
            console.log(response)
            try {
                if (this.loggingIn) {
                    console.log("quitting bc logging in")
                    return;
                }
                this.loggingIn = true;
                if (response.credential) {
                    console.log("got credential")
                    // Send the credential to your auth backend.
                    const credential = response.credential;
                    const id_token = credential;
                    const response2 = await fetch("/api/oauth-login", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ token: id_token, provider: "google" })
                    });
                    let data = await response2.json();
                    // let json = await response.json();
                    this.$emit("login", data);
                } else {
                    console.log("no crediential")
                    // No credential was selected. The user cancelled.
                    this.loginError = "Login cancelled";
                }

            } catch (e) {
                console.log(e);
                this.loginError = "please contact support.  Error. Try again if you want, or contact support@dreamgenerator.ai for help " + e.message;
            } finally {
                this.loggingIn = false;
            }
        },
        goToGoogle() {
            window.open("https://accounts.google.com/signup/v2/webcreateaccount?hl=en&flowName=GlifWebSignIn&flowEntry=SignUp", "_blank");
        }
    }
}
</script>
<template>
    <div class="google-login-button-container" ref="root">
        <!-- <button class="google-login-button" @click="startGoogleSignIn()">
            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" xmlns:xlink="http://www.w3.org/1999/xlink" style="display: block; height: 25px;">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                <path fill="none" d="M0 0h48v48H0z"></path>
            </svg>
            <div>Sign In With Google</div>
        </button> -->
        <div id="component-google-button" ref="realGoogleButton"></div>
        <div class="error" v-if="loginError">{{ loginError }}</div>
    </div>
</template>
<style lang="scss">
.google-login-button-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    width: 100%;
    svg {
        margin-right: 9px;
    }
    #component-google-button {
        // z-index: -1;
        // position: fixed;
        // opacity: 0;
    }
    .google-login-button {
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
    #google-button {
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
    .sign-up-google-button {
        width: 25px;
        border-radius: 5px;
        padding: 5px 8px;
        border: 1px solid gainsboro;
    }
}
</style>