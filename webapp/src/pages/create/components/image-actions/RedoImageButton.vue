<script lang="ts" setup>
import Vue, { defineComponent } from 'vue';
import axios from "axios";
import { mdiRedo } from "@mdi/js";
import { SavedImageData } from '@/lib/imageSave';
import { store } from '@/store';
import { clearSelectedImage } from '@/lib/clearSelectedImage';
import { ImageInProgress } from '../../createImage';

const props = defineProps<{
    image: SavedImageData | ImageInProgress
    iconSize: number;
}>();

function setPromptInfo() {
    store.imageRequestSettings.prompt = props.image.prompt;
    store.imageRequestSettings.style = props.image.style;
    clearSelectedImage(props.image.taskId);
}

</script>
<template>
    <div class="redo-image-button">
        <btn @click="setPromptInfo">
            <v-icon :icon="mdiRedo" :size="iconSize" />
            <div>Redo</div>
        </btn>
    </div>
</template>
<style lang="scss">
.redo-image-button {}
</style>