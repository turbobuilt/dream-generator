<script lang="ts">
import Vue, { defineComponent } from 'vue';
import axios from "axios";
import { store } from '@/store';
import { arrayBuffer } from 'stream/consumers';
import ImageResult from './ImageResult.vue';

export default defineComponent({
    components: { ImageResult },
    props: [],
    data() {
        return {
            search: "",
            store
        }
    },
    mounted() {

    },
    computed: {
        currentGroup() {
            for (let group of store.imageGenerationRequests) {
                for (let image of group.items) {
                    if (image.complete || image.downloading) {
                        console.log("currentGroup", group);
                        return group;
                    }
                }
            }
            return null;
        },
        inProgress() {
            if (store.currentImage)
                return false;
            if (!this.currentGroup)
                return false;
            for (let image of this.currentGroup.items) {
                if (!image.complete) {
                    return true;
                }
            }
        },
        firstImage() {
            return store.currentImage || (this.currentGroup && this.currentGroup.items[0]);
        },
        currentImageData() {
            return store.currentImage?.arrayBuffer;
        }
    },
    methods: {
        closeTriggered() {
            if (store.currentImage) {
                store.currentImage = null;
                return;
            }
            store.imageGenerationRequests = store.imageGenerationRequests.filter(group => group !== this.currentGroup);
            console.log("closeTriggered", store.imageGenerationRequests);
        }
    }
})
</script>
<template>
    <!-- class="display-image-results-bottom-sheet" -->
    <bottom-sheet :modelValue="store.currentImage || currentGroup" @close="closeTriggered()" :prevent-close="inProgress" >
        <div class="bg-image"></div>
        <div class="display-image-results">
            <ImageResult v-if="store.currentImage" :image="store.currentImage" :showClose="true" @close="closeTriggered()" />
            <template v-else>
                <div v-for="(image, index) of currentGroup.items" :key="image.taskId" class="result-container">
                    <ImageResult :image="image" :showClose="index === currentGroup.items.length - 1" @close="closeTriggered()" />
                </div>
            </template>
        </div>
    </bottom-sheet>
</template>
<style lang="scss">
.display-image-results-bottom-sheet {
    // position: relative;
}
.display-image-results {
    display: flex;
    flex-grow: 1;
    flex-shrink: 1;
    min-height: 0;
    .result-container {
        width: 100%;
    }
    // overflow-y: auto;
    .bg-image {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: -1;
    }
    .downloading {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 10px;
        // height: 100%;
    }
    .error {
        color: red;
        padding: 5px;
    }
}
</style>