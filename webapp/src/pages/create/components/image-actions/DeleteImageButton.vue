<script lang="ts" setup>
import Vue, { defineComponent } from 'vue';
import axios from "axios";
import { mdiTrashCan } from "@mdi/js";
import { SavedImageData, deleteImage } from '@/lib/imageSave';
import { showConfirm } from '@/ui-elements/ShowModal/showModal';
import { store } from '@/store';
import { clearSelectedImage } from '@/lib/clearSelectedImage';
import { ImageInProgress } from '../../createImage';

const props = defineProps<{
    image: SavedImageData | ImageInProgress
    iconSize: number;
}>();

async function localDelete() {
    if (!await showConfirm({ title: "Delete Image", content: "Are you sure you want to delete this image?" }))
        return;
    
    await deleteImage(props.image.taskId);
    clearSelectedImage(props.image.taskId);
    // delete from store.images
    for (let i = store.images.length - 1; i >= 0; i--) {
        if (store.images[i].taskId === props.image.taskId) {
            store.images.splice(i, 1);
        }
    }
}

</script>
<template>
    <div class="delete-image-button">
        <btn @click="localDelete">
            <v-icon :icon="mdiTrashCan" :size="iconSize" />
            <div>Delete</div>
        </btn>
    </div>
</template>
<style lang="scss">
.delete-image-button {}
</style>