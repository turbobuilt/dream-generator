<script lang="ts">
import { defineComponent } from 'vue';
import axios, { AxiosResponse } from "axios";
import { store } from "../../store";

export default defineComponent({
    components: {},
    props: ["close"],
    data() {
        return {
            error: "",
            email: "",
            submitting: false,
            loginLinkSent: false,
            insecureToken: "",
        }
    },
    methods: {
        cancelClicked() {
            if(this.submitting)
                return;
            this.close(false);
        },
        async submitEmail() {
            try {
                if (!this.email.match(/.+@.+\..+/)) {
                    this.error = "Invalid email";
                    return;
                }
                this.error = "";
                this.submitting = true;
                let response = await axios.get(`/api/get-send-login-with-email`, {
                    params: {
                        email: this.email
                    }
                });
                this.insecureToken = response.data.insecureToken;
                this.loginLinkSent = true;
                this.startEmailVerificationPolling();
            } catch (err) {
                console.error(err);
                this.error = "Error: " + err?.response?.data?.error || err.message;
            } finally {
                this.submitting = false;
            }
        },
        async startEmailVerificationPolling() {
            let response: AxiosResponse | null = null;
            try {
                response = await axios.get("/api/get-poll-login-email", {
                    params: {
                        insecureToken: this.insecureToken
                    }
                });
                if (response?.data.verified) {
                    let { authenticatedUser, token } = response.data.data;
                    localStorage.setItem("token", token);
                    localStorage.setItem("accountCreated", "true");
                    store.authenticatedUser = authenticatedUser;
                    store.authenticatedUser
                    store.token = token;
                    this.pollingEmailVerification = false;
                    this.success = true;
                    this.close();
                }
            } catch (err) {
                console.error(err);
            } finally {
                if (!response?.data?.verified) {
                    setTimeout(() => this.startEmailVerificationPolling(), 1000);
                }
            }
        },
    },
})
</script>
<template>
    <div class="login-modal-inline">
        <template v-if="!loginLinkSent">
            <v-text-field v-model="email" label="Enter your email" type="text" :autofocus="true" hide-details="auto" @keydown.enter="submitEmail" />
            <br>
            <div class="buttons">
                <v-btn color="primary" @click="submitEmail">
                    <div v-if="!submitting">Submit</div>
                    <v-progress-circular indeterminate v-else color="white" :size="24" />
                </v-btn>
                <v-btn @click="cancelClicked">Cancel</v-btn>
            </div>
            <div v-if="error" class="error">{{ error }}</div>
        </template>
        <div v-else>
            <div>
                A login link has been sent to your email. Click the link to login.
            </div>
            <div style="display:flex;justify-content:center;padding-top:10px;">
                <v-progress-circular indeterminate color="primary" size="20" />
            </div>
        </div>
    </div>
</template>
<style lang="scss">
.login-modal-inline {
    // padding: 10px;
    width: 100%;
    // max-width: 400px;
    .error {
        color: red;
        padding: 10px 0 0;
    }
}
</style>