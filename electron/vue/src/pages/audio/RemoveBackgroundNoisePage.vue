<script setup lang="ts">
import { onBeforeMount, reactive } from 'vue';
import { convertToOutputFormat, extractAudio } from './lib/convertToWav';
import { computed } from 'vue';
import { store } from '../../store';
import moment from 'moment';
import { onMounted } from 'vue';
import ModelDownloadProgress from "../../components/ModelDownloadProgress.vue";
import { removeNoiseJs } from '../../app/audio/noiseSuppression';

const d = store.backgroundNoiseRemovalState;
const modelDownloadMessage = "This file isn't too big (less than 50 MB)."

onBeforeMount(() => {
    console.log("store models", store.models);
    if (!d.modelData) {
        d.modelData = store.models[d.currentModelId];
    }
})

function onFileChange(event) {
    d.file = event.target.files[0];
    removeNoise();
}

async function removeNoise() {
    const d = store.backgroundNoiseRemovalState;
    if (!d.file) {
        console.error('No file selected');
        return;
    }
    try {
        d.error = "";
        d.percent = 1;
        d.convertingInputFile = true;
        d.extractingAudioPercent = 0;
        let data = new Uint8Array(await d.file.arrayBuffer());
        let { data: wav, extension, sampleRate } = await extractAudio(data, ({ progress, time }) => {
            d.extractingAudioPercent = Math.round(progress * 100);
        });
        d.convertingInputFile = false;
        d.removingNoise = true;
        let start = Date.now();
        let result = await removeNoiseJs({
            buffer: wav, 
            outputToFile: true,
            onProgress: ({ current, total }) => {
                d.percent = Math.round((current / total) * 100);
                let timeRemaining = Math.round((Date.now() - start) / current * (total - current) / 1000);
                d.estimatedTimeRemaining = moment.utc(timeRemaining * 1000).format('HH:mm:ss');
            },
            device: "CPU",
            outputWavPath: null
        });
        if (result) {
            result = new Uint8Array(result);
            result = await convertToOutputFormat(result, extension, sampleRate);
            d.error = "";
            const blob = new Blob([result], { type: 'audio/wav' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `cleaned.${extension}`
            a.click();
        }
    } catch (err) {
        console.error(err.stack);
        d.error = err || "Error removing noise, no further information ";
    } finally {
        d.convertingInputFile = false;
        d.removingNoise = false;
        d.extractingAudioPercent = null;
    }
    return;
}
</script>
<template>
    <div class="remove-background-noise-page">
        <v-card>
            <v-card-title>Remove Background Noise</v-card-title>
            <v-card-text>
                <div v-if="!d.modelData.downloaded || !d.modelData.extracted">
                    <ModelDownloadProgress :modelData="d.modelData" :message="modelDownloadMessage" />
                </div>
                <div v-else>
                    <p>Remove background noise from an audio file</p>
                    <br>
                    <div v-if="!d.removingNoise && !d.convertingInputFile">
                        <input type="file" id="audioInput" accept="audio/*" @change="onFileChange">
                    </div>
                    <br>
                    <div class="progress-group">
                        <template v-if="d.convertingInputFile">
                            <h4>Extracting...</h4>
                            <v-progress-linear :modelValue="d.extractingAudioPercent"></v-progress-linear>
                        </template>
                        <template v-else-if="d.removingNoise">
                            <h4>Removing Noise</h4>
                            <div class="progress-info">
                                <div>{{ d.percent }}%</div>
                                <div>ETA:{{ d.estimatedTimeRemaining }}</div>
                            </div>
                            <v-progress-linear :modelValue="d.percent"></v-progress-linear>
                            <br>
                            <!-- <div>Do not leave this page, or processing will be cancelled. We may remove this requirement in the future. These models take so much compute, it doesn't really make sense to be running multiple AI processes at a time anyway.</div> -->
                        </template>
                    </div>
                </div>
                <div class="error" v-if="d.error">{{ d.error }}</div>
            </v-card-text>
        </v-card>
    </div>
</template>
<style scoped lang="scss">
.remove-background-noise-page {
    // padding: 10px;
    .progress-group {
        h4 {
            margin-bottom: 10px;
        }
    }
    .progress-info {
        display: flex;
        justify-content: space-between;
    }
    .error {
        color: red;
        padding: 10px 0;
    }
}
</style>