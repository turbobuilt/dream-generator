<script lang="ts">
import { loadFacebookLoginCode } from '@/lib/facebooklogin';


export default {
    data() {
        return {
            loginError: "",
            loggingIn: false
        }
    },
    created() {
        loadFacebookLoginCode();
    },
    methods: {
        async handleFacebookLogin(data) {
            console.log("data is", data);
            try {
                let response = await fetch("/api/oauth-login", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ token: data.authResponse.accessToken, provider: "facebook", userId: data.authResponse.userID, facebookData: data.authResponse })
                });
                if (!response.ok) {
                    throw new Error("Error logging in " + (await response.text()));
                }
                console.log("response is", response);
                let json = await response.json();
                this.$emit("login", json);
            } catch (err) {
                console.log(err);
                this.loginError = err.message;
            } finally {

            }
        },
        async startFacebookLogin() {
            try {
                if (this.loggingIn)
                    return;
                this.loggingIn = true;

                if (window.location.href.indexOf("localhost") > -1) {
                    var data: any = { "authResponse": { "userID": "1032257461308891", "expiresIn": 6867, "accessToken": "EAAWowY7I064BO8FSjpMPGu3aCdOIp0NzoVtkHm5BZBoMM7mb59mYphMev1Ybk22PvOK5hD9bUUG0bSBhFkhZCdBXbB8iO8YMvZBkOnina3ONuT0H8csGMBkm8E4WSQyVdsrbmlN8NlV6yhS1u738iKuqjpSPcwZASXQMBZCJZAUVCeN0a2vrlhBTm2vaDMA3UBNZCrUp5LgbmrLkmRYjAZDZD", "signedRequest": "4k0ZwpudCsbPgVsKpWwaw3A4YV1VdCoXe0zkL5BuRjs.eyJ1c2VyX2lkIjoiMTAzMjI1NzQ2MTMwODg5MSIsImNvZGUiOiJBUUNDd0M1dHFGWlRfUGxGeWdzUHV2TFRsNkMxeDh4OFRSSkRhU1MxUF9BdHRpY1c0UnFld0VwaGkxQXoyekVPTlpiTkktNWpYbVlnbGRwdkRiMnNYQ3dKdTN6MFBCejhWeGs2THNCVElZaUlXMThiSGZWWTJ1SEQ4TDFfTm94SDlkaXFyQnBMUUpCWGpoNHE0QXFrWnAwSjZ4TkFRSVlrSjR1TUJJa2lIT2gzRC1ZUFRPamZ0aDNuMGgzTGdmT0ktSGxjRmNUZTNvVEVaZm9jWnZUYWF2ajBZVUJ1X3FrMWg3UndOdUhPV2RBQk4zbnlXa2c3X0ZxWGo2Y3pYdGtMWURTcTI4SnZCYW02ME14R21YT1Q0Sy1PRlo1LTlOSXl3a1RyWjNja1pWRHBzZmktRWlHU3otVmxWZ1JkY3d0cjJiZVhyN0JteWhVcW1XS0VqV1BiUHpta2VVcGljZ3BtWW0yR0FyRXlBaFFjc3dvZ3B6Z01uVy10cFJ1ZjJTcTJyeDgiLCJhbGdvcml0aG0iOiJITUFDLVNIQTI1NiIsImlzc3VlZF9hdCI6MTcwNjM0NjMzM30", "graphDomain": "facebook", "data_access_expiration_time": 1714122333 }, "status": "connected" };

                    await this.handleFacebookLogin(data);
                    return;
                }

                let fb = await loadFacebookLoginCode()
                var data = await new Promise((resolve, reject) => {
                    fb.login((response: any) => {
                        console.log(response);
                        if (response.status === "connected") {
                            resolve(response);
                        } else {
                            this.loginError = "Login cancelled";
                            reject(new Error("Login cancelled"));
                        }
                    }, { scope: "public_profile,email" });
                }) as any;
                await this.handleFacebookLogin(data);
            } catch (err) {
                console.log(err);
                this.loginError = err.message;
            } finally {
                this.loggingIn = false;
            }
        },
    }
}
</script>
<template>
    <div class="facebook-login-component">
        <div class="facebook-button-container button-container">
            <div class="facebook-login" @click="startFacebookLogin">
                <template v-if="!loggingIn">
                    <svg viewBox="0 0 213 213" preserveAspectRatio="xMinYMin" class="fb_button_svg_logo login_fb_logo single_button_svg_logo">
                        <path d="M90,212v-75h-27v-31h27v-25q0,-40 40,-40q15,0 24,2v26h-14q-16,0 -16,16v21h30l-5,31h-27v75a106 106,0,1,0,-32 0" class="f_logo_circle" fill="white"></path>
                        <path d="M90,212v-75h-27v-31h27v-25q0,-40 40,-40q15,0 24,2v26h-14q-16,0 -16,16v21h30l-5,31h-27v75a106 106,1,0,1,-32 0" class="f_logo_f" fill="white"></path>
                    </svg>
                    <span class="facebook-login-text">Login with Facebook</span>
                </template>
                <v-progress-circular v-else indeterminate color="white" size="25" />
            </div>
        </div>
        <div v-if="loginError" class="error">{{ loginError }}</div>
    </div>
</template>
<style lang="scss">
.facebook-login-component {
    width: 100%;
    .error {
        padding: 10px;
        color: red;
    }
    .facebook-login {
        text-align: center;
        cursor: pointer;
        border-radius: 4px;
        font-size: 16px;
        height: 40px;
        background-color: rgb(26, 119, 242);
        color: rgb(255, 255, 255);
        border: 0px;
        // font-weight: bold;
        display: flex;
        justify-content: center;
        flex-grow: 1;
        align-items: center;
        padding: 5px 15px;
        .fb_button_svg_logo {
            margin-right: 10px;
            margin-bottom: .1em;
            height: 1.5em;
            padding: 0.065em;
            overflow-clip-margin: content-box;
            overflow: hidden;
            .f_logo_f {
                fill: transparent;
            }
        }
        span {
            // margin-left: 8px;
            margin: 0 auto;
        }
    }
}
</style>