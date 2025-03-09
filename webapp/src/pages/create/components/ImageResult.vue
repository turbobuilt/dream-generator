<script lang="ts" setup>
import Vue, { defineComponent } from 'vue';
import PublishImageButton from './image-actions/PublishImageButton.vue';
import ShareImageButton from './image-actions/ShareImageButton.vue';
import SaveImageButton from './image-actions/SaveImageButton.vue';
import RedoImageButton from './image-actions/RedoImageButton.vue';
import ModifyImageButton from './image-actions/ModifyImageButton.vue';
import DeleteImageButton from './image-actions/DeleteImageButton.vue';
import { computed } from 'vue';
import { mdiClose } from "@mdi/js";
import { ImageInProgress } from '../createImage';
// import { SavedImageData } "@/lib/imageSave";
import { SavedImageData } from "@/lib/imageSave";


// const props = defineProps(["image", "showClose"]);
const props = defineProps<{
    image: ImageInProgress & SavedImageData
    showClose: boolean;
}>();

function arrayBufferToUrl(arrayBuffer: ArrayBuffer) {
    let blob = new Blob([arrayBuffer], { type: "image/jpeg" });
    return URL.createObjectURL(blob);
}

let imageUrl = computed(() => {
    if (props.image.arrayBuffer) {
        return arrayBufferToUrl(props.image.arrayBuffer);
    }
    return "";
});

const iconSize = 24;
</script>
<template>
    <div class="image-result">
        <div class="image-result-bg" :style="{ backgroundImage: `url(${imageUrl})` }"></div>
        <div class="image-display" >
            <div v-if="image.downloading" class="downloading">
                <div>Downloading...</div>
                <div>{{ image.downloadingPercent?.toFixed(1) }}%</div>
                <v-progress-linear :model-value="image.downloadingPercent" color="primary" />
                <!-- <v-progress-circular color="primary" :size="70" :model-value="image.downloadingPercent" style="margin-top: 20px;">
                    <div>{{ image.downloadingPercent?.toFixed(1) }}%</div>
                </v-progress-circular> -->
            </div>
            <img v-else-if="image.arrayBuffer" :src="imageUrl" />
            <div v-else-if="image.error" class="error">{{ image.error }}</div>
            <div v-else>{{ image.statusMessage || 'In Progress' }}</div>
        </div>
        <div class="image-all-buttons" v-if="image.arrayBuffer">
            <div class="image-actions">
                <PublishImageButton :image="image" :iconSize="iconSize" v-if="!image.isRemoveBackground" />
                <ShareImageButton :image="image" :iconSize="iconSize" />
                <SaveImageButton :image="image" :iconSize="iconSize" />
                <RedoImageButton :image="image" :iconSize="iconSize" />
                <ModifyImageButton :image="image" :iconSize="iconSize" />
                <DeleteImageButton :image="image" :iconSize="iconSize" />
            </div>
            <div v-if="showClose">
                <btn class="close-btn" @click="$emit('close', true)">
                    <div>Close</div>
                    <v-icon :icon="mdiClose" :size="iconSize" />
                </btn>
            </div>
        </div>
    </div>
</template>
<style lang="scss">
@import "../../../scss/variables.scss";
.image-result {
    width: 100%;
    max-height: 100%;
    display: flex;
    flex-direction: column;
    position: relative;
    // padding-bottom: 5px;
    // margin-bottom: 5px;
    $blur: 5px;
    $buttonBg: rgba($darkBg, .8);
    $gap: 12px;
    $fontSize: 12px;
    @media (min-aspect-ratio: 1/1.5) {
        /* Styles for non-portrait aspect ratios */
        flex-direction: row;
    }
    .image-all-buttons {
        padding: $gap;
    }
    .image-display {
        max-height: 100%;
        display: flex;
    }
    .close-btn {
        font-size: $fontSize;
        margin-top: $gap;
        display: flex;
        padding: 7px;
        background-color: $buttonBg;
    }
    .close-btn .v-btn__content {
        display: flex;
        justify-content: space-between;
        width: 100%;
    }
    .downloading {}
    .image-result-bg {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-size: cover;
        background-position: center;
        filter: blur($blur);
        -webkit-filter: blur($blur);
        z-index: -1;
    }
    img {
        max-width: 100%;
        // width: 100%;
        max-height: 100%;
        min-height: 0;
        min-width: 0;
    }
    .image-actions {
        // padding: $gap;
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        // make square
        // grid-template-rows: repeat(2, 1fr);
        grid-auto-rows: min-content;
        align-items: start;
        gap: $gap;
        >div {
            // aspect-ratio: 1 / 1;
            // height
        }
        // $darkBg opacity .5
        .btn.v-btn {
            height: 100%;
            background-color: $buttonBg;
            font-size: $fontSize;
            padding: 10px 3px;
            .v-btn__content {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                .v-icon {
                    margin-bottom: 4px;
                }
            }
        }
    }
}
</style>