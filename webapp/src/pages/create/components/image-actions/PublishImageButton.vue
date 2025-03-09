<script lang="ts" setup>
import Vue, { defineComponent } from 'vue';
import axios from "axios";

import { mdiCloudUploadOutline, mdiCheck } from "@mdi/js";
import { reactive } from 'vue';
import { SavedImageData, saveImage } from '@/lib/imageSave';
import { store } from '@/store';
import { showModal } from '@/ui-elements/ShowModal/showModal';
import PickUserName from '@/modals/PickUserName.vue';
import { imageToAvif } from '@/lib/publish';
import { handleHttpError } from '@/lib/handleHttpError';
import { ImageInProgress } from '../../createImage';
// import { imageToAvif } from '@/lib/publish';

const props = defineProps<{
    image: SavedImageData | ImageInProgress
    iconSize: number;
}>();

const d = reactive({
    publishing: false,
    publishingPercent: 0
})

async function publishPrompt() {
    console.log("publishPrompt");
    if (d.publishing || (props.image as SavedImageData).published) {
        return;
    }
    console.log(store.authenticatedUser.userName);
    if (!store.authenticatedUser.userName) {
        let userNameData = await showModal({ component: PickUserName, closable: false });
        console.log(userNameData);
    }
    try {
        store.publishingImage = true;
        d.publishing = true;
        let image = props.image;
        d.publishingPercent = 1;
        let avif = imageToAvif(image.arrayBuffer);
        d.publishingPercent = 10;
        let [response, imageData] = await Promise.all([
            axios.post("/api/publish-prompt", {
                prompt: image.prompt,
                style: image.style,
                model: image.model,
                imageSize: 1,
            }), avif]);
        if (response.data.error) {
            return { error: response.data.error }
        }
        d.publishingPercent = 15;
        console.log("done")
        let { share } = response.data;
        (image as SavedImageData).sharedImage = share.id;
        let uploadUrl = response.data.uploadUrl;
        console.log("uploading")
        await axios.put(uploadUrl, imageData, {
            headers: {
                "Content-Type": "image/avif",
            },
            onUploadProgress: (progressEvent) => {
                d.publishingPercent = 15 + Math.floor(progressEvent.loaded / progressEvent.total * 75);
            }
        });
        let confirmResult = await axios.put(`/api/shared-image/${response.data.sharedImage.id}`, {
            uploaded: true,
        });
        (props.image as SavedImageData).sharedImage = confirmResult.data.sharedImage.id;
        d.publishingPercent = 100;
        console.log("Share data", confirmResult.data);
        (props.image as SavedImageData).published = true;
        console.log("image is", props.image);
        await saveImage(props.image);
    } catch (error) {
        handleHttpError(error, "publishing image");
    } finally {
        d.publishing = false;
        store.publishingImage = false;
    }
}
</script>
<template>
    <div class="publish-image-button">
        <btn @click="publishPrompt">
            <div class="publish-image-button-content" v-if="(image as SavedImageData).published">
                <v-icon :icon="mdiCheck" :size="iconSize" />
                <div>Published!</div>
            </div>
            <div class="publish-image-button-content" v-else-if="d.publishing">
                <v-progress-circular indeterminate :size="18" />
                <div class="publishing-percent">{{ d.publishingPercent }}%</div>
            </div>
            <div class="publish-image-button-content" v-else-if="!(image as SavedImageData).published">
                <v-icon :icon="mdiCloudUploadOutline" :size="iconSize" />
                <div>Publish</div>
            </div>
        </btn>
    </div>
</template>
<style lang="scss">
.publish-image-button {
    .publish-image-button-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }
    .publishing-percent {
        margin-top: 5px;
    }
}
</style>