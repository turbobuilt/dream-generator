<script setup lang="ts">
import { computed, reactive } from 'vue';
import { formatBytes } from "../lib/helpers"

const props = defineProps(['modelData',"message"]);
const d = reactive({

})

const estimatedTimeRemaining = computed(() => {
    if (!props.modelData.downloadSpeed) return 0;
    let seconds = (props.modelData.downloadContentLength - props.modelData.bytesDownloaded) / props.modelData.downloadSpeed;
    if (seconds > 60) {
        return Math.floor(seconds / 60) + " minutes " + (seconds % 60).toFixed(0) + " seconds";
    } else if (seconds > 60*60) {
        return (seconds / 60 / 60).toFixed(1) + " hours";
    } else {
        return seconds.toFixed(0) + " seconds";
    }
});

async function startDownload() {
    if (props.modelData.downloading) return;
    props.modelData.downloading = true;
    props.modelData.error = "";
    window.nativeBridge.downloadModel({
        id: props.modelData.id,
        onProgress: (model) => {
            Object.assign(props.modelData, model);
        }
    });
}
</script>
<template>
    <div class="model-download-progress">
        <div v-if="!modelData.downloading && !modelData.extracting" class="load-button-container">
            <div class="load-button-container">
                <v-btn color="primary" @click="startDownload()">Download!</v-btn>
            </div>
            <br>
            <div v-if="message">{{ message }}</div>
            <div v-else>It's a pretty big file (several gigabytes), so make sure you have a good connection or it could take a while. Why so big? Well, truth be told, the bigger the model, the more detail it can learn to make! So it's a good thing it's big.</div>
        </div>
        <div v-else-if="modelData.downloading">
            <h2>Downloading</h2>
            <br>
            <div class="download-status">
                <div>{{ formatBytes(modelData.bytesDownloaded) }} / {{ formatBytes(modelData.downloadContentLength) }} ({{ formatBytes(modelData.downloadSpeed) }}/s)</div>
                <div>{{ estimatedTimeRemaining }} remaining</div>
            </div>
            <v-progress-linear :key="modelData.id" :model-value="(modelData.bytesDownloaded / modelData.downloadContentLength) * 100"></v-progress-linear>
        </div>
        <div v-else-if="modelData.extracting">
            <div>Extracting model... this may take a moment.</div>
            <!-- <br>
        <v-progress-linear :model-value="modelData.extractProgress" color="primary"></v-progress-linear> -->
        </div>
        <div v-if="modelData.error" class="error">
            <div>{{ modelData.error }}</div>
            <!-- <v-btn color="primary" @click="startDownload()">Try Again</v-btn> -->
        </div>
    </div>
</template>
<style lang="scss">
.model-download-progress {
    width: 100%;
    display: flex;
    flex-direction: column;
    .load-button-container {
        display: flex;
        flex-direction: column;
    }
    .error {
        padding: 10px 0;
        color: red;
    }
    .download-status {
        display: flex;
        justify-content: space-between;
    }
}
</style>