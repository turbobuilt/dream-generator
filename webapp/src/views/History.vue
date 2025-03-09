<script lang="ts">
import { store } from '@/store';
import { defineComponent } from 'vue';
import { getImages, deleteImage } from '../lib/imageSave';

export default defineComponent({
    data() {
        return {
            images: []
        }
    },
    async mounted() {
        this.images = await getImages();
    },
    methods: {
        showImage(image) {
            store.currentImage = image;
            console.log("pushing")
            this.$router.push(`/image/local?taskId=${image.taskId}`);
        },
    }
})
</script>
<template>
    <div class="history-page">
        <div class="images">
            <div class="image" v-for="image in images" :key="image.id" @click="showImage(image)">
                <img :src="image.url" />
                <div class="prompt">{{ image.prompt }}</div>
            </div>
        </div>
    </div>
</template>
<style lang="scss">
.history-page {
    .images {
        display: flex;
        flex-wrap: wrap;
        .image {
            cursor: pointer;
            position: relative;
            width: 33%;
            display: flex;
            img {
                width: 100%;
            }
            .prompt {
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                background: rgba(0, 0, 0, 0.5);
                color: white;
                padding: 5px;
                text-overflow: ellipsis;
                line-height: 1.2;
            }
            @media (max-width: 768px) {
                width: 100%;
            }
        }
    }
}
</style>