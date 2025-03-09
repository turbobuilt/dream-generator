<script lang="ts">
import FacebookLoginButton from "../FacebookLoginButton.vue";
import GoogleLoginButton from "../GoogleLoginButton.vue";
import { store } from "../../store";
import { handleHttpError } from "@/lib/handleHttpError";
import { defineComponent } from "vue";
import axios from "axios";

declare var google: any;
export default defineComponent({
    props: ["show"],
    components: {
        FacebookLoginButton,
        GoogleLoginButton
    },
    data() {
        return {
            showingEmailForm: false,
            email: "",
            signingUp: false,
            error: "",
            registrationEmailSent: false
        }
    },
    async created() {
    },
    mounted() {

    },
    methods: {
        async submitEmail() {
            try {
                if (!this.email) {
                    this.error = "Please enter an email address";
                    return;
                }
                if (!this.email.includes("@")) {
                    this.error = "Please enter a valid email address";
                    return;
                }
                this.signingUp = true;
                let response = await axios.post(`/api/post-create-account-email`, {
                    email: this.email
                });
                this.registrationEmailSent = true;
            } catch (err) {
                handleHttpError(err, "Signing up");
            } finally {
                this.signingUp = false;
            }
        }
    }
})
</script>
<template>
    <div class="email-register-component">
        <template v-if="!registrationEmailSent">
            <button v-if="!showingEmailForm" class="login-button" @click="showingEmailForm = true">Register with Email</button>
            <div v-if="showingEmailForm">
                <v-text-field v-model="email" label="Email" :autofocus="true" :hide-details="true" @keypress.enter.prevent="submitEmail" />
                <div class="submit-button-container">
                    <v-btn class="register-button" color="primary" @click="submitEmail()">
                        <div v-if="!signingUp">Register</div>
                        <v-progress-circular v-else indeterminate color="white" :size="20"></v-progress-circular>
                    </v-btn>
                </div>
            </div>
        </template>
        <template v-else>
            <div>Email sent! Please check your email to get started making awesome stuff!</div>
        </template>
        <div v-if="error" class="error">{{ error }}</div>
    </div>
</template>
<style lang="scss">
.email-register-component {
    width: 100%;
    .login-button {
        background: white;
        display: flex;
        border: 4px solid silver;
        border-radius: 4px;
        justify-content: center;
        align-items: center;
        width: 100%;
    }
    .error {
        padding: 10px 0;
        color: red;
    }
    .register-button {
        width: 100%;
    }
    .submit-button-container {
        display: flex;
        justify-content: center;
        padding-top: 10px;
    }
}
</style>