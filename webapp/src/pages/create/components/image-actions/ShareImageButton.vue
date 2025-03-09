<script lang="ts" setup>
import Vue, { defineComponent } from 'vue';
import axios from "axios";

import { mdiShare } from "@mdi/js";
import { SavedImageData } from '@/lib/imageSave';
import { ImageInProgress } from '../../createImage';

const props = defineProps<{
    image: SavedImageData | ImageInProgress
    iconSize: number;
}>();

async function startShare() {
    navigator.share({
        title: "Image from AI Art",
        text: "Check out this image I created with AI Art!",
        url: window.location.href,
        files: [new File([props.image.arrayBuffer], `${props.image.extension}`, { type: `image/png` })]
    });
}
</script>
<template>
    <div class="share-image-button">
        <btn @click="startShare">
            <v-icon :icon="mdiShare" :size="iconSize" />
            <div>Share</div>
        </btn>
    </div>
</template>
<style lang="scss">
.share-image-button {

}
</style>