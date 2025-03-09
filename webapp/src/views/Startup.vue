<template>
    <div class="startup-page">
        <label>
            <input type="checkbox" v-model="cloudSync" />
            Sync with Cloud
        </label>
        <p>
            By default, images are private but are synced to the cloud. If you want maximum privacy, disable sync. Note, if you clear your browser data, the images you make will go bye-bye. You may want this. If so, uncheck the box and it will not sync images. Also we are offering a feature soon where you can unsync individual files so they aren't on servers that we control.
        </p>
        <v-btn @click="save" :disabled="saving">{{ saving ? "Saving..." : "Save" }}</v-btn>
    </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import axios from "axios";

export default defineComponent({
    data() {
        return {
            cloudSync: false,
            saving: false
        };
    },
    methods: {
        async save() {
            try {
                this.saving = true;
                await axios.put("/api/update-cloud-sync", {
                    cloudSync: this.cloudSync
                });
            } catch (err) {
                console.error(err);
            } finally {
                this.saving = false;
            }
        }
    },
});
</script>
<style lang="scss">
.startup-page {
    button {
        margin-top: 10px;
    }
}
</style>