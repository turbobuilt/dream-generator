<script lang="ts" setup>
import Vue, { defineComponent } from 'vue';
import axios from "axios";
import { mdiPalette } from "@mdi/js";
import { SavedImageData } from '@/lib/imageSave';
import { store } from '@/store';
import { clearSelectedImage } from '@/lib/clearSelectedImage';
import router from '@/router';
import { ImageInProgress } from '../../createImage';

const props = defineProps<{
    image: SavedImageData | ImageInProgress
    iconSize: number;
}>();

function modifyImage() {
    let file = new File([props.image.arrayBuffer], `image.${props.image.extension}`);
    store.selectedEditImageFiles = null
    router.replace("/edit-image");
    clearSelectedImage(props.image.taskId);
    setTimeout(() => {
        store.selectedEditImageFiles = file;
    }, 100);
}

</script>
<template>
    <div class="modify-image-button">
        <btn @click="modifyImage">
            <v-icon :icon="mdiPalette" :size="iconSize" /> 
            <div>Modify</div>
        </btn>
    </div>
</template>
<style lang="scss">
.modify-image-button {

}
</style>