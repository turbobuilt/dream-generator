<script lang="ts" setup>
import { ISO_8601 } from 'moment';
import { onBeforeUnmount } from 'vue';
import { onUnmounted } from 'vue';
import { onMounted } from 'vue';
import { reactive } from 'vue';
import { getTable } from "../../lib/database"
import { store } from '../../store';
import ModelDownloadProgress from "../../components/ModelDownloadProgress.vue"
import { models } from '../../app/models/models';
// import { startImageServer, stopImageServer } from "../../app/image/imageModelFunctions";

const d = store.textToImageState;

onMounted(async () => {
    let modelsTable = await getTable("models");
    if (!modelsTable[d.currentModelId]) {
        modelsTable[d.currentModelId] = {}
    }
    if (!d.modelData) {
        d.modelData = store.models[d.currentModelId];
        let model = models[d.currentModelId];
        await model.init();
        console.log("model", model)
        Object.assign(d.modelData, modelsTable[d.currentModelId]);
    }
});

onUnmounted(() => {
    if (d.modelLoaded || d.modelLoading) {
        d.modelLoaded = false;
        (window as any).nativeBridge.imageFunctions.stopImageServer(models[d.currentModelId]);
    }
});

function formatRamUsage() {
    // convert from bytes to GB
    return (d.ramUsage / 1024 / 1024 / 1024).toFixed(2) + " GB";
}

async function generateImage() {
    d.makingImage = true;
    d.imageData = null;
    d.imageGenerationPercent = 0;
    (window as any).nativeBridge.imageFunctions.generateImage({
        model: models[d.currentModelId],
        steps: d.steps,
        prompt: d.prompt,
        onStatusChange: (statusMessage, ramUsage) => {
            console.log("received status message", statusMessage, ramUsage);
            statusMessage = statusMessage.trim()
            if (ramUsage) {
                d.ramUsage = ramUsage.memory;
            }
            if(statusMessage.indexOf('start_inference') > -1) {
                d.imageGenerationPercent = 1;
            }
            if(statusMessage.indexOf('text_embeddings_computed') > -1) {
                d.imageGenerationPercent = 2;
            }
            if(status.indexOf('timesteps_computed') > -1) {
                d.imageGenerationPercent = 3;
            }
            // std::cout << "status: step_" << inference_step << "_time: " << elapsed.count() << std::endl;
            if (statusMessage.indexOf('step_') > -1) {
                let info = statusMessage.match(/step_(\d+)_time: ([\d\.]+)/);
                let step = parseInt(info[1]);
                let time = parseFloat(info[2]);
                d.iterationTime = time;
                d.imageGenerationPercent = parseFloat((step * 100 / d.steps * .9).toFixed(1)) + 5
            }
        },
        onComplete: (imageData) => {
            console.log("image data", imageData);
            let blob = new Blob([imageData], { type: 'image/jpeg' });
            let url = URL.createObjectURL(blob);
            d.imageData = url;
            d.makingImage = false;
        }
    });
}

async function loadModel() {
    d.modelLoading = true;
    d.serverLoadingPercent = 0;
    (window as any).nativeBridge.imageFunctions.startImageServer(models[d.currentModelId], (statusMessage, ramUsage) => {
        statusMessage = statusMessage.trim();
        if (statusMessage == "lora_loaded") {
            d.serverLoadingPercent = 5;
        } else if (statusMessage == "text_encoder_loaded") {
            d.serverLoadingPercent = 15;
        } else if (statusMessage == "unet_loaded") {
            d.serverLoadingPercent = 70;
        } else if (statusMessage == "vae_decoder_loaded") {
            d.serverLoadingPercent = 85;
        } else if (statusMessage == "tokenizer_loaded") {
            d.serverLoadingPercent = 95;
        } else if (statusMessage == "waiting_for_prompt") {
            d.serverLoadingPercent = 100;
            d.modelLoading = false;
            d.modelLoaded = true;
        }
        console.log("status change", statusMessage);
    });
}

function downloadImage(imageData) {
    let a = document.createElement('a');
    a.href = imageData;
    a.download = 'dream.png';
    a.click();
}

function reset() {
    d.imageData = null;
    d.prompt = '';
}

function formatPercent(value) {
    return ((value || 0) * .8).toFixed(0);
}

</script>
<template>
    <div class="text-to-image-page">
        <template v-if="d.imageData">
            <v-card class="share-tools-container">
                <div class="content">
                    <v-btn color="primary" @click="reset">Generate Another</v-btn>
                    <v-btn color="primary" @click="downloadImage(d.imageData)">Share</v-btn>
                </div>
            </v-card>
            <v-card >
                <v-card-text>
                    <img class="result" v-if="d.imageData" :src="d.imageData" />
                </v-card-text>
            </v-card>
        </template>
        <v-card v-if="!d.imageData">
            <v-card-text v-if="d.modelData">
                <div v-if="!d.modelData.downloaded || !d.modelData.extracted">
                    <ModelDownloadProgress :modelData="d.modelData" />
                </div>
                <div v-else-if="d.modelLoaded" class="main-content">
                    <template v-if="!d.imageData">
                        <div class="prompt-input-container">
                            <v-textarea :rows="1" :auto-grow="true" label="Enter a description of the image you want to see." v-model="d.prompt" hide-details="auto" :autofocus="true" @keydown.enter.prevent="generateImage"></v-textarea>
                            <v-text-field class="num-steps-input" v-model="d.steps" label="Detail Level" type="number" min="2" max="60" hide-details="auto" />
                        </div>
                        <v-btn class="generate-button" color="primary" @click="generateImage">
                            <div v-if="!d.makingImage">Generate!</div>
                            <v-progress-circular v-else indeterminate color="white" :size="22"></v-progress-circular>
                        </v-btn>
                        <br>
                        <div v-if="d.makingImage" class="generating-image-container">
                            <!-- <div>Generating image...</div> -->
                            <br>
                            <div style="display: flex;justify-content: center; font-size: 18px; margin: 10px 0;">{{ formatPercent(d.imageGenerationPercent) }}%</div>
                            <v-progress-linear :model-value="(d.imageGenerationPercent || 0) * .8" color="primary"></v-progress-linear>
                        </div>
                    </template>
                </div>
                <div v-else-if="d.modelLoading">
                    <h4>Welcome to Dream Generator</h4>
                    <br>
                    <div>The model is currently loading. Depending on your hardware this can take a while.</div>
                     <!-- {{ d.serverLoadingPercent }}</div>
                    <br>
                    <v-progress-linear :model-value="d.serverLoadingPercent" color="primary"></v-progress-linear> -->
                </div>
                <div v-else>
                    <div class="load-button-container">
                        <v-btn color="primary" @click="loadModel()">Load Image Generator</v-btn>
                    </div>
                    <br>
                    <div>Please make sure your system has at least 12GB of RAM that it can dedicate to this for best performance. You will notice a severe decrease in speed if you have less than 12GB of RAM available. Generally speaking, it can work just fine with less, it will just be slow and could lead system instability.</div>
                </div>
            </v-card-text>
        </v-card>
    </div>
</template>
<style lang="scss">
.text-to-image-page {
    flex-direction: column;
    display: flex;
    height: 100%;
    .share-tools-container {
        padding: 10px;
        height: auto !important;
        margin-bottom: 10px;
        .content {
            display: flex;
            justify-content: space-between;
        }
    }
    >.v-card, .v-card-text {
        flex-direction: column;
        display: flex;
        height: 100%;
    }
    .load-button-container {
        width: 100%;
        display: flex;
        flex-direction: column;
    }
    .prompt-input-container {
        display: flex;
        width: 100%;
        .num-steps-input {
            max-width: 100px;
        }
    }
    .main-content {
        display: flex;
        flex-direction: column;
        height: 100%;
        >* {
            flex-grow: 0;
        }
        // align-items: center;
    }
    .generating-image-container {
        // padding-top: 10px;
    }
    .generate-button {
        width: 100%;
        margin-top: 15px;
    }
    .result {
        max-width: 100%;
        min-width: 0;
        min-height: 0;
        object-fit: contain;
    }
}
</style>