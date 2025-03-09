<script lang="ts" setup>
import Vue, { defineComponent } from 'vue';
import axios from "axios";

import { mdiImageAlbum } from "@mdi/js";
import { SavedImageData } from '@/lib/imageSave';
import { ImageInProgress } from '../../createImage';

const props = defineProps<{
    image: SavedImageData | ImageInProgress
    iconSize: number;
}>();

async function saveImage() {
    // save image.arrayBuffer and download
    let blob = new Blob([props.image.arrayBuffer], { type: "image/png" });
    let url = URL.createObjectURL(blob);
    let a = document.createElement("a");
    a.href = url;
    a.download = "image.png";
    a.click();
}

</script>
<template>
    <div class="save-image-button">
        <btn @click="saveImage">
            <v-icon :icon="mdiImageAlbum" :size="iconSize" />
            <div>Save</div>
        </btn>
    </div>
</template>
<style lang="scss">
.save-image-button {

}
</style>