<script lang="ts">
import { defineComponent } from 'vue';
import axios from "axios";
import { store } from "../../store";

export default defineComponent({
    name: 'LoginPage',
    data() {
        return {
            error: ""
        }
    },
    async mounted() {
        try {
            let response = await axios.post(`/api/post-email-login-token`, { token: this.$route.query.token });
            let { authenticatedUser, token } = response.data;
            localStorage.setItem("token", token);
            localStorage.setItem("accountCreated", "true");
            store.authenticatedUser = authenticatedUser;
            store.authenticatedUser
            store.token = token;
            // document.cookie = `token=${token};path=/`;
            // this.$emit("login");
            this.$router.replace("/create");
        } catch (err) {
            console.error(err);
            this.error = "Error: " + err?.response?.data?.error || err.message;
        } finally {

        }
    }
});
</script>
<template>
    <div class="login-page">
        <v-progress-circle indeterminate></v-progress-circle>
        <br>
        <div v-if="error">{{ error }}</div>
    </div>
</template>
<style lang="scss">
.login-page {
    padding: 16px;
    text-align: center;
    .error {
        color: red;
        padding: 10px;
    }
}
</style>