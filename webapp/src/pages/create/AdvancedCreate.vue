<script lang="ts">
import Vue, { computed, defineComponent } from 'vue';
import axios from "axios";
import { store } from '@/store';
import { createImage } from './createImage';

export default defineComponent({
    props: [],
    data() {
        return {
            search: "",
            store,
            makingImage: false,
        }
    },
    mounted() {

    },
    computed: {
        pendingImages: () => store.imageGenerationRequests.filter(item => !item.complete)
    },
    methods: {
        generateImage() {
            if (this.creatingImage)
                return;
            createImage(this);
        }
    }
})

</script>
<template>
    <div class="advanced-create-page">
        <div style="display: flex;">
            <v-textarea v-model="store.imageRequestSettings.prompt" label="Prompt" :auto-grow="true" :rows="1" hide-details="auto" />
            <div style="width: 100px;">
                <v-text-field type="number" v-model.number="store.imageRequestSettings.quantity" label="Qty" hide-details="auto" />
            </div>
        </div>
        <div>
            <v-select v-model="store.imageRequestSettings.model" :items="store.imageGenerationModels" item-title="label" item-value="value" label="Style" hide-details="auto" />
        </div>
        <br>
        <div>
            <btn @click="generateImage">{{ this.makingImage ? "Submitting..." : "Generate" }}</btn>
        </div>
        <br>
        <div class="images-in-progress-container">
            <h2>Currently Generating</h2>
            <div class="images-in-progress">
                <div v-for="imageGenerationRequest of pendingImages" class="image-in-progress">
                    <v-progress-circular indeterminate="true" />
                    <div>Quantity: {{ imageGenerationRequest.items?.length }}</div>
                </div>
            </div>
        </div>
    </div>
</template>
<style lang="scss">
.advanced-create-page {
    display: flex;
    flex-direction: column;
    .images-in-progress-container {
        width: 100%;
        max-width: 400px;
        margin: 0 auto;
        background: gainsboro;
        flex-grow: 1;
        h2 {
            margin-bottom: 10px;
            font-size: 18px;
            text-align: center;
        }
        .images-in-progress {
            overflow-y: auto;
        }
    }
    .image-in-progress {
        display: flex;
        align-items: center;
        background: gainsboro;
        border-bottom: gray;
        padding: 5px;
        // justify-content: center;
        .v-progress-circular {
            margin-right: 10px;
        }
    }
}
</style>