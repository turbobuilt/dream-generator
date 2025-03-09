<script lang="ts" setup>
import { defineProps } from 'vue';
import FeatherIcon from "../../../lib/FeatherIcon.vue"
import { computed } from 'vue';
import { watch } from 'vue';
import { reactive } from 'vue';
import { ImageGenerationRequest } from './getImageGenerationRequestStatus';

let props = defineProps(["imageGenerationRequests"]) as {
    imageGenerationRequests: ImageGenerationRequest[]
};

let d = reactive({
    currentRequest: null
});

watch(() => props.imageGenerationRequests, (imageGenerationRequests) => {
    selectFirstWithInfo(imageGenerationRequests);
}, { immediate: true, deep: true });

function selectFirstWithInfo(imageGenerationRequests: ImageGenerationRequest[]) {
    if (!d.currentRequest) {
        for (let request of imageGenerationRequests) {
            if (!request.results) {
                continue;
            }
            for (let taskId in request.results) {
                let result = request.results[taskId];
                if (result.file || result.error) {
                    d.currentRequest = request;
                    return;
                }
            }
        }
    }
}

function closeClicked() {
    props.imageGenerationRequests.splice(props.imageGenerationRequests.indexOf(d.currentRequest), 1);
    d.currentRequest = null;
    selectFirstWithInfo(props.imageGenerationRequests);
}

</script>
<template>
    <div class="display-results-modal">
        <v-dialog :modelValue="d.currentRequest" :scrim="false" persistent>
            <div class="results-container" v-if="d.currentRequest">
                <div class="header">
                    <div class="title">View Images</div>
                    <v-spacer />
                    <FeatherIcon class="close-icon" icon="x" @click="closeClicked" />
                </div>
                <div v-for="error of d.currentRequest.errors">{{ error }}</div>
                <div class="num-pending" v-if="d.currentRequest.numPending > 0">{{ d.currentRequest.numPending }} still loading</div>
                <div class="image-results">
                    <div v-for="result in d.currentRequest.results" class="image-result">
                        <img v-if="result.outputUrl" :src="result.outputUrl" class="output-img" />
                        <div v-else-if="result.error" class="error">{{ result.error }}</div>
                        <div v-else class="image-downloading-placeholder">
                            Downloading
                            <v-progress-circular indeterminate color="primary" />
                        </div>
                    </div>
                </div>
            </div>
        </v-dialog>
    </div>
</template>
<style lang="scss">
.results-container {
    .error {
        padding: 10px;
        color: red;
    }
    width: 100%;
    max-height: calc(100vh - 20px);
    overflow: auto;
    background: white;
    padding: 10px;
    padding-top: 0;
    box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.75);
    .header {
        display: flex;
        align-items: center;
        padding: 5px 0;
        .title {
            font-size: 16px;
            font-weight: bold;
        }
    }
    .close-icon {
        padding: 2px;
        transition: all 0.2s all;
        cursor: pointer;
        border-radius: 2px;
        &:hover {
            background: gainsboro;
        }
    }
}
</style>