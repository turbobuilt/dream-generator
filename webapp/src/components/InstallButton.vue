<script lang="ts">
import { defineComponent } from 'vue';
import { installPrompt } from "../lib/pwa";

export default defineComponent({
    name: "InstallButton",
    data() {
        return {
            show: false
        }
    },
    async created() {
        // check if service worker is installed
        let registrations = await navigator.serviceWorker.getRegistrations();
        if (!registrations.length)
            this.show = true;
    },
    methods: {
        install() {
            installPrompt.event.prompt();
        },
    }
})
</script>
<template>
    <div class="install-button-container" v-if="show">
        <v-btn @click="install" color="primary">Setup App</v-btn>
    </div>
</template>
<style lang="scss">
.install-button-container {
    width: 100%;
    display: flex;
    padding: 15px;
    background: red;
}
</style>