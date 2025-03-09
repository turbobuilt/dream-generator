<script lang="ts" setup>
import { callMethod } from '@/lib/callMethod';
import { store } from '@/store';
import { showAlert } from '@/ui-elements/ShowModal/showModal';
import { onMounted, reactive } from 'vue';

const d = reactive({
    text: '',
    loading: false,
    outputUrl: null,
    textToSpeechModels: null as any[],
    selectedModelId: null as string,
})

onMounted(() => {
    getTextToSpeechModels();
})

async function getTextToSpeechModels() {
    try {
        let result = await callMethod("getTextToSpeechModels",[]);
        if (result.error) {
            console.error(result.error);
            showAlert(result.error);
            return;
        }
        d.textToSpeechModels = result;
        console.log(result)
        d.selectedModelId = result[0].id;
    } catch (error) {
        console.error(error);
        alert(JSON.stringify(error));
    }
}

async function generateAudio() {
    try {
        if (!d.text) {
            showAlert("Please enter some text to generate audio");
            return;
        }
        d.outputUrl = null;
        d.loading = true;
        // call the API to generate audio
        let result = await callMethod("generateTextToSpeech", [d.text, d.selectedModelId]);
        if (result.error) {
            console.error(result.error);
            showAlert(result.error);
            return;
        }
        
        // now poll
        for (var i = 0; i < 5000; i++) {
            let pollResult = await callMethod("pollTextToSpeechStatus", [result.falId]);
            console.log("pollResult", pollResult);
            if (pollResult?.textToSpeech.outputUrl) {
                d.outputUrl = pollResult.textToSpeech.outputUrl;
                store.authenticatedUser.creditsRemaining = pollResult.creditsRemaining;
                return;
            } else if (pollResult.error) {
                showAlert(pollResult.error);
                return;
            }
            await new Promise(r => setTimeout(r, 1000));
        }
        showAlert("The time limit of waiting has passed, and still no result. Please try again later or contact support@dreamgenerator.ai if you have a super big file.");
    } catch (error) {
        console.error(error);
        alert(JSON.stringify(error));
    } finally {
        d.loading = false;
    }
}
async function downloadOutput() {
    if (!d.outputUrl) return;
    let a = document.createElement('a');
    a.href = d.outputUrl;
    a.download = "output.mp3";
    a.click();
}
</script>
<template>
    <div class="text-to-speech-page" ref="root" v-scrollable>
        <h1>Have an awesome AI read your script!</h1>
        <v-textarea :auto-grow="true" :max-rows="4" :rows="1" v-model="d.text" label="Enter your text here" />
        <div class="generate-audio-container">
            <v-select v-if="d.textToSpeechModels" v-model="d.selectedModelId" :items="d.textToSpeechModels" label="Select Model" item-title="name" item-value="id" />
            <v-btn @click="generateAudio" color="primary" v-if="!d.loading && d.text">Generate Audio</v-btn>
        </div>
        <div class="progress-container">
            <v-progress-circular v-if="d.loading" indeterminate color="primary"></v-progress-circular>
        </div>
        <br>
        <div v-if="d.outputUrl" class="output-container">
            <audio :src="d.outputUrl" controls></audio>
            <v-btn @click="downloadOutput" color="primary">Download</v-btn>
        </div>
        <div style="flex-grow: 1;"></div>
    </div>
</template>
<style lang="scss">
@import '@/scss/variables.scss';
.text-to-speech-page {
    justify-content: flex-start;
    padding: 5px;
    .progress-container {
        display: flex;
        justify-content: center;
        margin-top: 10px;
    }
    .output-container {
        display: flex;
        flex-direction: column;
        audio {
            width: 100%;
            margin-bottom: 10px;
        }
    }
}
</style>