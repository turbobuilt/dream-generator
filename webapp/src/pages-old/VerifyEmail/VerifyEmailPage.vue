<script lang="ts">
import { defineComponent } from 'vue';
import axios from "axios";
import { store } from "../../store";

export default defineComponent({
    data() {
        return {
            error: "",
            verifying: true,
            success: false,
            password: "",
            passwordSubmitted: false,
            submittingPassword: false
        }
    },
    async mounted() {
        // try {
        //     this.verifying = true;
        //     let response = await axios.post(`/api/post-verify-email`, { token: this.$route.query.token });
        //     let { authenticatedUser, token } = response.data;
        //     localStorage.setItem("token", token);
        //     localStorage.setItem("accountCreated", "true");
        //     store.authenticatedUser = authenticatedUser;
        //     store.authenticatedUser
        //     store.token = token;
        //     this.success = true;
        //     // this.$router.replace("/create");
        // } catch (err) {
        //     console.error(err);
        //     this.error = "Error: " + " err.message";
        // } finally {
        //     this.verifying = false;
        // }
    },
    methods: {
        async submitPassword() {
            try {
                this.error = "";
                this.submittingPassword = true;
                let response = await axios.post(`/api/post-verify-email`, { password: this.password, token: this.$route.query.token});
                let { authenticatedUser, token } = response.data;
                localStorage.setItem("token", token);
                localStorage.setItem("accountCreated", "true");
                store.authenticatedUser = authenticatedUser;
                store.authenticatedUser
                store.token = token;
                this.success = true;
            } catch (err) {
                console.error(err);
                this.error = err?.response?.data?.error || err.message || "Unknown Error";
            } finally {
                this.submittingPassword = false;
            }
        }
    
    }
});
</script>
<template>
    <div class="verify-email-page">
        <div v-if="!success" class="enter-password-section">
            <v-text-field v-model="password" label="Choose Your Password" type="text" :autofocus="true" @keypress.enter.submit="submitPassword"></v-text-field>
            <v-btn @click="submitPassword" color="primary">
                <div v-if="!submittingPassword">Activate Account</div>
                <v-progress-circle indeterminate v-else :size="24" color="white"></v-progress-circle>
            </v-btn>
        </div>
        <br>
        <div v-if="error" class="error">{{ error }}</div>
        <v-dialog v-model="success" persistent :max-width="400">
            <v-card>
                <v-card-title>Success</v-card-title>
                <v-card-text>
                    <p>Your email has been verified!</p>
                    <br>
                    <!-- <p>You may continue in the other window where you signed up, or you can keep going here.</p> -->
                </v-card-text>
                <v-card-actions>
                    <v-btn color="primary" @click="$router.push('/create')">Get Started!</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>
<style lang="scss">
.verify-email-page {
    padding: 16px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    .error {
        color: red;
        padding: 10px;
    }
    .enter-password-section {
        width: 100%;
        max-width: 400px;
    }
}
</style>