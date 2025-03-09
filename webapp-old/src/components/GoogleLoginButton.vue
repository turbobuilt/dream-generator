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
            google.accounts.id.renderButton(
                document.getElementById("component-google-button"),
                {
                    // theme: "outline", 
                    size: "large",
                    // 'scope': 'profile email',
                    // 'width': 240,
                    // 'height': 50,
                    'longtitle': true,
                    'theme': 'filled_blue',
                }  // customization attributes
            );
            // google.accounts.id.prompt(); // also display the One Tap dialog
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
                    let json = await response.json();
                    this.$emit("login", json);
                } else {
                    console.log("no crediential")
                    // No credential was selected. The user cancelled.
                    this.loginError = "Login cancelled";
                }
                console.log("bob");

            } catch (e) {
                console.log(e);
                this.loginError = "please contact support.  Error. Try again if you want, or contact support@dreamgenerator.ai for help " + e.message;
            } finally {
                this.loggingIn = false;
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
    <div class="google-login-button">
        <div id="component-google-button" class="login-button">
            <div class="loading">Loading Google Sign In</div>
        </div>
        <div class="error" v-if="loginError">{{ loginError }}</div>
    </div>
</template>
<style lang="scss">
.google-login-button {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-height: 40px;
    border-radius: 5px;
    position: relative;
    background-color: #1b73e8;
    width: 100%;
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
    }
    .sign-up-google-button {
        width: 25px;
        border-radius: 5px;
        padding: 5px 8px;
        border: 1px solid gainsboro;
    }
}
</style>