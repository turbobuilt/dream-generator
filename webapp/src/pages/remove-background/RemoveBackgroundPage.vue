<script lang="ts" setup>
import { reactive } from 'vue';
import PickImage from '../edit/components/PickImage.vue';
import { computed } from 'vue';
import AutoGrowTextArea from '@/ui-elements/AutoGrowTextArea.vue';
import { serverMethods } from '@/serverMethods';
import axios from 'axios';
import FormData from 'form-data';
import { handleHttpError } from '@/lib/handleHttpError';
import { store } from '@/store';
import { downloadFile, ImagePromptInProgress, startPollImageStatusTimer } from '../create/createImage';
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
    output: null,
    error: "",
    taskInfo: null as { uploadPercent: number, uploading: boolean, working: boolean, output: string, error: string, outExtension: string, image: File, inputImageUrl: string }[]
});

function imagesSelected(images) {
    submit(images);
}
async function submit(images) {
    images = Array.from(images);
    d.taskInfo = [];
    let promises = await Promise.allSettled(images.map(async (image, index) => {
        try {
            d.taskInfo[index] = {
                uploadPercent: 0,
                uploading: true,
                working: false,
                output: null,
                error: "",
                image: image,
                outExtension: "",
                inputImageUrl: URL.createObjectURL(image)
            };
            d.taskInfo[index].uploadPercent = 0;
            d.taskInfo[index].uploading = true;
            var form = new FormData();
            form.append('image', image, { filename: "image" });
            let response = await axios.post(`/api/submit-remove-image-background`, form, {
                onUploadProgress: (progressEvent) => {
                    console.log("progressEvent", progressEvent);
                    d.taskInfo[index].uploadPercent = Math.round((progressEvent.loaded / progressEvent.total) * 100);
                },
                responseType: "arraybuffer"
            });
            d.taskInfo[index].working = false;
            d.taskInfo[index].uploading = false;
            
            if (response.data.error) {
                d.taskInfo[index].error = response.data.error;
                return;
            } else if (response.headers["content-type"]?.startsWith("image")) {
                console.log("content type", response.headers["content-type"]);
                var extension = response.headers["content-type"]?.split("/").at(-1);
                if (extension === "jpeg") {
                    extension = "jpg";
                }
                d.taskInfo[index].outExtension = extension.toLowerCase();
                var imageBytes = response.data;
                d.taskInfo[index].output = URL.createObjectURL(new Blob([imageBytes], { type: response.headers["content-type"] }));
                var creditsRemaining = parseFloat(response.headers["x-credits-remaining"]);
                await downloadFile({ 
                    outputUrl: d.output,
                    model: "birefnet" as any,
                    taskId: crypto.randomUUID(),
                    status: "COMPLETE",
                }, {
                    model: "birefnet",
                    prompt: "Remove Background",
                    isRemoveBackground: true,
                    style: "",
                }, () => {});
                if (!isNaN(creditsRemaining) && store.authenticatedUser) {
                    console.log("store", store.authenticatedUser)
                    store.authenticatedUser.creditsRemaining = creditsRemaining;
                }
            }
        } catch (err) {
            handleHttpError(err, "uploading image");
        } finally {
            
        }
    }));
    console.log("promises", promises);
}

function downloadOutput(task) {
    var a = document.createElement("a");
    a.href = task.output;
    a.download = task.image.name.replace(/\.[^/.]+$/, "") + "-no-background." + task.outExtension;
    a.click();
}

function reset() {
    d.output = null;
    store.selectedEditImageFiles = null;
    d.uploading = false;
    d.uploadPercent = null;
    d.error = "";
    d.taskInfo = null;
}
</script>
<template>
    <div class="remove-background-image-page">
        <PickImage style="margin-bottom: 5px;" @selected="imagesSelected" v-if="!d.taskInfo" />
        <div v-if="d.taskInfo">
            <div class="clear-row">
                <v-btn @click="reset()" color="primary">Clear</v-btn>
            </div>
            <div class="tasks">
                <div v-for="task in d.taskInfo" class="task">
                    <div class="preview">
                        <img :src="task.inputImageUrl" v-if="!task.output" />
                        <img :src="task.output" v-else="task.output" />
                        <div class="buttons" v-if="task.output">
                            <v-btn size="small" @click="downloadOutput(task)" color="primary">Download</v-btn>
                        </div>
                        <div v-if="task.uploading || task.working" style="width: 100%; padding: 5px;">
                            <div class="loading">
                                <BouncingLoadingDots />
                                <div class="text">
                                    <div v-if="task.uploading">
                                        <div class="time-indicator" v-if="task.uploading && task.uploadPercent != 100">{{ task.uploadPercent }}% uploaded</div>
                                        <div class="time-indicator" v-else>Takes about 30 seconds...</div>
                                    </div>
                                    <div v-else>Submitting Prompt</div>
                                </div>
                            </div>
                        </div>
                        <div v-if="task.error" style="color: red; padding: 5px;">{{ task.error }}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<style lang="scss">
.remove-background-image-page {
    display: flex;
    flex-direction: column;
    padding: 5px;
    overflow-y: auto;
    .clear-row {
        padding: 5px 0;
    }
    .tasks {
        display: flex;
        flex-wrap: wrap;
    }
    .task {
        margin: 5px;
        .preview {
            height: 400px;
            width: 400px;
            padding: 5px;
            background: white;
            border: 2px solid gray;
            border-radius: 3px;
            position: relative;
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;
            img {
                flex-shrink: 1;
                min-height: 0;
                min-width: 0;
            }
            .buttons {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                padding: 5px;
                display: flex;
                justify-content: center;
            }
        }
    }
    .output-container {
        img {
            width: 100%;
            object-fit: contain;
            max-height: 80vh;
        }
    }
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