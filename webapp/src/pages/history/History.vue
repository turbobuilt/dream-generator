<script lang="ts">
import { store } from '../../store';
import { defineComponent } from 'vue';
import { getImages, deleteImage } from '../../lib/imageSave';
import Create from '../create/Create.vue';
import { vars } from '../../lib/vars';
import HistoryImage from './components/HistoryImage.vue';

export default defineComponent({
    components: { Create, HistoryImage },
    data() {
        return {
            vars,
            store
        }
    },
    async mounted() {
        store.images = await getImages();
    },
    methods: {
        showImage(image) {
            store.currentImage = image;
        },
    }
})
</script>
<template>
    <div class="history-page">
        <div class="images-grid" v-if="store.images && store.images.length">
            <HistoryImage class="item" v-for="image in store.images" :key="image.id" @click="showImage(image)" :image="image" />
        </div>
        <div v-if="store.images && !store.images.length" class="start-notice">
            <p>Welcome to Dream Generator.</p>
            <p>Click "Type here to create your images" below to get started and type what you want to see!</p>
        </div>
        <Create :class="{ 'fixed-bottom': vars.isMobile }" />
    </div>
</template>
<style lang="scss">
.history-page {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    .start-notice {
        flex-grow: 1;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 10px;
        flex-direction: column;
        p {
            text-align: center;
        }
    }
    .fixed-bottom {
        // position: fixed;
        // bottom: 0;
        // left: 0;
        // right: 0;
        // z-index: 1;
    }
}
.images-grid {
    // display: flex;
    // flex-wrap: wrap;
    flex-grow: 1;
    // align-items: flex-start;
    flex-shrink: 1;
    display: grid;
    overflow-y: auto;
    grid-template-columns: repeat(3, 1fr);
    @media(min-width: 768px) {
        grid-template-columns: repeat(5, 1fr);
    }
    @media(min-width: 1024px) {
        grid-template-columns: repeat(6, 1fr);
    }
    grid-auto-rows: min-content;
    align-items: start;
    gap: 5px;
    -webkit-overflow-scrolling: touch;
    .item {
        cursor: pointer;
        position: relative;
        aspect-ratio: 1/1;
        // width: 33%;
        display: flex;
        position: relative;
        .image {
            width: 100%;
            height: 100%;
            background-size: cover;
            // opacity: 0;
        }
        .prompt {
            max-height: calc(2.4em + 10px);
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
    }
}
</style>