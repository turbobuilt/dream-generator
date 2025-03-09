<script lang="ts">
import { loadFacebookLoginCode } from "@/lib/facebooklogin";
import FacebookLoginButton from "@/components/FacebookLoginButton.vue";
import { store } from "../store";
declare var google: any;

var fb = null;
export default {
    props: ["show"],
    components: {
        FacebookLoginButton
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
        // check if window.google exists every .5 seconds
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
            google.accounts.id.initialize({
                client_id: "790316791498-utie09qvamofv7put3tfbgltjnkghrjk.apps.googleusercontent.com",
                callback: this.handleCredentialResponse, // callback function
            });
            google.accounts.id.renderButton(
                document.getElementById("google-button"),
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
                    const { authenticatedUser, token, newUser, error } = await response2.json();

                    if (error) {
                        this.loginError = error;
                    } else {
                        store.authenticatedUser = authenticatedUser;
                        store.token = token;
                        // set cookie "token" to token with no expiry
                        document.cookie = `token=${token};path=/`;
                        // save token and user to local storage
                        localStorage.setItem("token", token);
                        localStorage.setItem("accountCreated", "true");
                    }
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
    <!-- <div class="login-modal" :style="{ zIndex: show ? 100 : -100 }"> -->
    <div class="login-modal" :style="{ zIndex: show ? 100 : -100 }">
        <div class="button-container">
            <div id="google-button" class="login-button"></div>
        </div>
        <div>
            <br>
            <div>Right now we only support login with Google.</div>
            <br>
            <div>If you don't have a Google account, you should get it because a Google account is amazing! Sign up here:</div>
            <br>
            <div class="button-container">
                <button class="login-button sign-up-google-button" @click="goToGoogle()">Create Google Account</button>
            </div>
        </div>
    </div>
    <!-- </div> -->
</template>
<style lang="scss">
.login-modal {

    // position: fixed;
    // top: 0;
    // left: 0;
    // width: 100%;
    // height: 100%;
    // display: flex;
    // justify-content: center;
    // align-items: center;
    // z-index: 100;
    // .login-modal-inner {
    width: 100%;
    max-width: 600px;
    border: 2px solid gray;
    border-radius: 4px;
    padding: 10px;
    // }
    position: fixed;
    background: white;
    // center
    transform: translate(-50%, -50%);
    top: 50%;
    left: 50%;
    #google-button {
        font-size: 16px;
        // background-color: rgb(162, 81, 62);
        [role=button] {
            // background: none !important;
        }
    }
    .sign-up-google-button {
        border-radius: 5px;
        padding: 5px 8px;
        border: 1px solid gainsboro;
    }
    .button-container {
        display: flex;
        justify-content: center;
        margin-bottom: 15px;
        > * {
            width: 300px;
        }
    }
    .login-button {
        height: 40px;
        // width: 50%;
        min-width: 200px;
    }
}
</style>