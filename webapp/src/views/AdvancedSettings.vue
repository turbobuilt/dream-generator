<script lang="ts">
import { defineComponent } from 'vue';
import axios from 'axios';
import { store } from '@/store';

export default defineComponent({
    name: 'advancedSettings',
    data() {
        return {
            saving: false,
            store
        };
    },
    methods: {
        async saveSettings() {
            try {
                this.saving = true;
                await axios.post('/api/update-nudity', { allowNudity: store.authenticatedUser.expandedContent });
            } catch (error) {
                console.error(error);
            } finally {
                this.saving = false;
            }
        },
    },
});
</script>
<template>
    <div class="advanced-settings-page">
        <!-- <div>
            <v-checkbox v-model="allowNudity" label="Allow Nudity" />
        </div> -->
        <div>
            <label for="allowNudity">
                <input type="checkbox" id="allowNudity" :checked="store.authenticatedUser.expandedContent" @change="store.authenticatedUser.expandedContent = ($event.target as HTMLInputElement).checked ? 1 : 0">
                Allow Nudity
            </label>
        </div>
        <br>

        <v-btn color="primary" @click="saveSettings" :disabled="saving">
            {{ saving ? 'Saving...' : 'Save' }}
        </v-btn>
    </div>
</template>  
<style scoped lang="scss">
.advanced-settings-page {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    // Add your styles here
    padding: 20px;
}
</style>
