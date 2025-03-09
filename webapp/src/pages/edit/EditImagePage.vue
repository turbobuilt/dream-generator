<script lang="ts" setup>
import { reactive } from 'vue';
import PickImage from './components/PickImage.vue';
import { computed } from 'vue';
import AutoGrowTextArea from '@/ui-elements/AutoGrowTextArea.vue';
import { serverMethods } from '@/serverMethods';
import axios from 'axios';
import FormData from 'form-data';
import { handleHttpError } from '@/lib/handleHttpError';
import { store } from '@/store';
import { ImagePromptInProgress, startPollImageStatusTimer } from '../create/createImage';
import BouncingLoadingDots from '../create/components/BouncingLoadingDots.vue';

const d = reactive({
    // selectedImage: null as File,
    editImageSettings: {
        prompt: "",
        similarity: 40
    },
    uploadPercent: null,
    uploading: false,
    working: false,
    error: ""
});

function imageSelected(image) {
    console.log(image);
    store.selectedEditImageFiles = image;
}

const fileUrl = computed(() => {
    return store.selectedEditImageFiles ? URL.createObjectURL(store.selectedEditImageFiles) : null;
});

async function submit() {
    if (d.editImageSettings.prompt.length < 5) {
        console.log("Description too short");
        return;
    }

    try {
        d.uploadPercent = 0;
        d.uploading = true;
        var form = new FormData();
        form.append('prompt', d.editImageSettings.prompt);
        form.append('image', store.selectedEditImageFiles, { filename: "image" });
        form.append('similarity', Math.round(d.editImageSettings.similarity));
        let response = await axios.post(`/api/submit-image-modify-with-prompt`, form, {
            onUploadProgress: (progressEvent) => {
                console.log("progressEvent", progressEvent);
                d.uploadPercent = Math.round((progressEvent.loaded / progressEvent.total) * 100);
            }
        });
        let promptInProgress: ImagePromptInProgress = {
            complete: false,
            startTime: Date.now(),
            error: null,
            isEdit: true,
            items: [{
                complete: false,
                settings: d.editImageSettings,
                startTime: Date.now(),
                taskId: response.data.taskId,
                arrayBuffer: null,
                downloading: false,
                downloadingPercent: null,
                error: null,
                extension: null,
                outputUrl: null,
                statusMessage: "",
            }]
        };
        store.imageGenerationRequests.push(promptInProgress);
        startPollImageStatusTimer();
        d.uploading = false;
        console.log("response is", response.data);
    } catch (err) {
        handleHttpError(err, "uploading image");
    } finally {
    }
}

let minChars = 5;
let buttonText = computed(() => {
    return d.editImageSettings.prompt.length < minChars ? (minChars - d.editImageSettings.prompt.length) + " more characters" : "Create";
});

const currentTask = computed(() => {
    for (let group of store.imageGenerationRequests) {
        if (!group.isEdit)
            continue;
        for (let image of group.items) {
            if (!image.complete) {
                return group;
            }
        }
    }
    return null;
});
</script>
<template>
    <div class="edit-image-page">
        <div style="flex-grow: 1"></div>
        <div v-if="fileUrl">
            <img class="preview" :src="fileUrl" />
            <div v-if="d.uploading || (currentTask && !currentTask.complete)">
                <div class="loading">
                    <BouncingLoadingDots />
                    <div class="text">
                        <div v-if="d.uploading">
                            <div class="time-indicator" v-if="d.uploading">{{ d.uploadPercent }}% uploaded</div>
                            <div class="time-indicator" v-else>Takes about 30 seconds...</div>
                        </div>
                        <div v-else>Submitting Prompt</div>
                        <div v-if="currentTask?.items?.length">
                            <div>{{ currentTask.items[0].statusMessage }}</div>
                        </div>
                    </div>
                </div>
            </div>
            <div v-else>
                <AutoGrowTextArea v-model="d.editImageSettings.prompt" placeholder="Describe your new image" @keypress.prevent.enter="submit" :autofocus="true" />
                <div style="margin-top: 7px; display: flex; width: 100%; justify-content: space-between; align-items: center; position: relative;">
                    <div class="small-text">Different</div>
                    <div style="font-weight: bold; margin: 0 10px; position: absolute; top: 50%; left: 50%; transform: translateX(-50%) translateY(-50%);">Similarity</div>
                    <div class="small-text">Similar</div>
                </div>
                <v-slider color="primary" density="compact" v-model="d.editImageSettings.similarity" thumb-label :step="1" :min="5" :max="60" style="margin-top: -5px; margin-bottom: -5px;" :hide-details="true" />
                <btn style="margin-top: 8px;" @click="submit">{{ buttonText }}</btn>
            </div>
            <div v-if="store.imagePollingError" style="color: red; padding: 5px;">{{ store.imagePollingError }}</div>
        </div>
        <PickImage style="margin-bottom: 5px;" @selected="imageSelected" v-else />
    </div>
</template>
<style lang="scss">
.edit-image-page {
    display: flex;
    flex-direction: column;
    padding: 5px;
    overflow-y: auto;
    .loading-container {
        display: flex;
    }
    .v-slider.v-input--horizontal {
        margin-inline: 0;
    }
    .small-text {
        font-size: 14px;
    }
    .v-textarea .v-field__input {
        mask-image: none;
        -webkit-mask-image: none;
    }
    textarea {
        min-height: 0;
        padding: 0;
    }
    .preview {
        width: 100%;
        max-height: 50vh;
        object-fit: cover;
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
            color: black;
            white-space: nowrap;
        }
    }
}
</style>