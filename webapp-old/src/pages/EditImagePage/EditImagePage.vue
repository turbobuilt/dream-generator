<script lang="ts">
import { defineComponent } from 'vue';
import ImageSelector from './components/ImageSelector.vue';

export default defineComponent({
    components: { ImageSelector },
    data() {
        return {
            file: null as File | null,
            prompt: "",
            processing: false
        }
    },
    computed: {
        fileURL() {
            return this.file ? URL.createObjectURL(this.file) : null;
        }
    },
    methods: {
        onFileDropped(file: File) {
            console.log("file dropped", file);
            this.file = file;
        }
    }
})
</script>
<template>
    <div class="edit-image-page">
        <ImageSelector @file-dropped="onFileDropped" v-if="!file" />
        <div v-else class="edit-image-container">
            <div class="settings">
                <v-textarea v-model="prompt" label="Updated Prompt" :rows="1" :max-rows="4" hide-details="auto" />
                <div class="redo-button" v-if="prompt">
                    <v-btn color="primary">
                        <v-progress-circular indeterminate size="24" color="white" v-if="processing"></v-progress-circular>
                        <div v-else>Redo</div>
                    </v-btn>
                </div>
            </div>
            <div class="image-container">
                <img :src="fileURL" />
            </div>
        </div>
    </div>
</template>
<style lang="scss" scoped>
.edit-image-page {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    .redo-button {
        display: flex;
        justify-content: center;
        margin: 10px;
    }
    .edit-image-container {
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        .settings {
            flex-grow: 0;
            width: 100%;
        }
        .image-container {
            flex-shrink: 1;
            flex-grow: 1;
            flex-basis: 0;
            max-width: 100%;
            min-width: 0;
            min-height: 0;
        }
        img {
            max-width: 100%;
            max-height: 100%;
        }
    }
}
</style>