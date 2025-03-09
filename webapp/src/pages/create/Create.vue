<script lang="ts">
import { defineComponent } from 'vue';
import StylePicker from './components/StylePicker.vue';
import CreateImageSettings from './components/CreateImageSettings.vue';
import BouncingLoadingDots from "./components/BouncingLoadingDots.vue";
import axios from 'axios';
import { handleHttpError, showHttpErrorIfExists } from '@/lib/handleHttpError';
import { CreateImageRequestSettings } from '@/serverModels/CreateImageRequestSettings';
import { createImage } from "./createImage";
import { createContext } from 'vm';
import { store, loadingGroup } from '@/store';
import AdvancedCreate from './AdvancedCreate.vue';


export default defineComponent({
    components: { StylePicker, CreateImageSettings, BouncingLoadingDots, AdvancedCreate },
    data() {
        return {
            minChars: 7,
            makingImage: false,
            error: "",
            store,
            loadingGroup
        }
    },
    created() {
        if(!store.imageRequestSettings) {
            store.imageRequestSettings = new CreateImageRequestSettings();
        }
    },
    methods: {
        async createImage() {
            if (this.store.imageRequestSettings.prompt?.length < this.minChars) {
                this.error = `Please enter at least ${this.minChars} characters`;
                return;
            }
            this.error = "";
            let result = await createImage(this);
            if (result?.error) {
                console.log("error", result.error);
                this.makingImage = false;
                this.error = result.error;
            }
        },
        keypress(event) {
            if (event.key === "Enter") {
                event.preventDefault();
                this.createImage();
            }
        },
        scrollIntoView() {
            setTimeout(() => {
                document.querySelector(".create-image-component")?.scrollIntoView({ behavior: "smooth" });
            }, 1000);
        }
    }
})

</script>
<template>
    <div class="create-image-component">
        <v-textarea @click="scrollIntoView" placeholder="Type here to create your image" :rows="1" :auto-grow="true" v-model="store.imageRequestSettings.prompt" variant="solo" style="box-shadow: none;" :hide-details="true" density="compact" @keypress="keypress" class="prompt-input" />
        <div v-if="store.imageRequestSettings.prompt">
            <StylePicker v-model:style="store.imageRequestSettings.style" />
            <CreateImageSettings :imageRequestSettings="store.imageRequestSettings" />
            <div v-if="makingImage || (loadingGroup && !loadingGroup.complete)">
                <div class="loading">
                    <BouncingLoadingDots />
                    <div class="text">
                        <div v-if="loadingGroup?.items?.at(0)?.statusMessage">{{ loadingGroup.items.at(0).statusMessage }}</div>
                        <div v-else>Submitting Prompt</div>
                    </div>
                </div>
                <div class="time-indicator">Takes about 30 seconds...</div>
            </div>
            <btn @click="createImage" v-else>{{ store.imageRequestSettings.prompt.length >= minChars ? "create image" : `${minChars - store.imageRequestSettings.prompt.length} More Characters` }}</btn>
            <div v-if="store.imagePollingError" style="color: red; padding: 5px;">{{ store.imagePollingError }}</div>
            <div v-if="error" style="color: red; padding: 5px;">{{ error }}</div>
        </div>
    </div>
</template>
<style lang="scss">
.create-image-component {
    padding: 5px;
    // background: rgb(234, 234, 234);
    background: rgb(57, 57, 57);
    .time-indicator {
        display: flex;
        justify-content: center;
        padding: 10px 5px;
        color: white;
    }
    .loading {
        padding: 8px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        .bouncing-loading-dots {
            max-width: 50%;
        }
        .text {
            margin-left: 8px;
            font-size: 16px;
            color: white;
            white-space: nowrap;
        }
    }
    .style-picker {
        color: white;
    }
    .v-field--variant-solo, .v-field--variant-solo-filled {
        background: none;
        box-shadow: none;
        textarea {
            padding-left: 4px;
            font-size: 18px;
            color: white;
            &::placeholder {
                color: white; // #555050;
                opacity: 1;
            }
        }
    }
    .v-btn {
        width: 100%;
        margin-bottom: 2px;
    }
}
</style>