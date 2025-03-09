<script lang="ts" setup>
import { nextTick, ref, reactive } from 'vue';

const emit = defineEmits(['selected']);
const root = ref<HTMLElement>(null);

const d = reactive({
    showInput: true,
    dragOver: false
});

function showImageSelector() {
    const input = root.value?.querySelector('input');
    if (input) {
        input.click();
    }
}

function selected(event) {
    const file = event.target.files[0];
    if (file) {
        emit('selected', event.target.files);
    }
    d.showInput = false;
    nextTick(() => {
        setTimeout(() => {
            d.showInput = true;
        }, 1);
    });
}

function handleDragEnter(event) {
    console.log("drag enter target", event.target, "currentTarget", event.currentTarget);
    if (event.target !== event.currentTarget)
        return;
    d.dragOver = true;
}

function handleDragLeave(event) {
    console.log("drag leave target", event.target, "currentTarget", event.currentTarget);
    if (event.target !== event.currentTarget)
        return;
    d.dragOver = false;
}

function handleDragOver(event) {
    event.preventDefault();
}

function handleDrop(event) {
    event.preventDefault();
    d.dragOver = false;
    if (event.dataTransfer?.files?.length) {
        const file = event.dataTransfer.files[0];
        if (file) {
            emit('selected', event.dataTransfer.files);
        }
        d.showInput = false;
        nextTick(() => {
            setTimeout(() => {
                d.showInput = true;
            }, 1);
        });
    }
}
</script>

<template>
    <div class="pick-image-component" ref="root">
        <input type="file" accept="*.jpg,*.jpeg,*.png,*.gif,*.heic,*.avif,*.webp" v-if="d.showInput" @change="selected($event)" multiple>
        <btn @click="showImageSelector()">Pick Image</btn>
        <div class="drop-zone" :class="{ 'drag-over': d.dragOver }" v-if="d.showInput" @dragenter.prevent="handleDragEnter" @dragleave.prevent="handleDragLeave" @dragover.prevent="handleDragOver" @drop.prevent="handleDrop">
            <p>Or drag and drop images here</p>
        </div>
    </div>
</template>

<style lang="scss">
.pick-image-component {
    display: flex;
    flex-direction: column;
    input {
        position: fixed;
        top: -1000px;
        z-index: -1;
    }
    .drop-zone {
        display: flex;
        justify-content: center;
        align-items: center;
        border: 2px dashed #ccc;
        border-radius: 5px;
        padding: 20px;
        text-align: center;
        margin-top: 10px;
        flex-grow: 0;
        background: whitesmoke;
        transition: .1s all;
        height: 250px;
        &.drag-over {
            background-color: gainsboro;
        }
        * {
            pointer-events: none;
        }
    }
}
</style>