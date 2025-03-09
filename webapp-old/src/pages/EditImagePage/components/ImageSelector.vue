<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    data() {
        return {
            hovering: false
        }
    },
    methods: {
        onDragOver(event: DragEvent) {
            event.preventDefault();
            event.stopPropagation();
            event.dataTransfer.dropEffect = 'copy';
            this.hovering = true;
        },
        onDragLeave(event: DragEvent) {
            event.preventDefault();
            event.stopPropagation();
            this.hovering = false;
        },
        onDrop(event: DragEvent) {
            event.preventDefault();
            event.stopPropagation();
            this.hovering = false;
            let files = event.dataTransfer.files;
            if (files.length > 0) {
                this.$emit('file-dropped', files[0]);
            }
        },
        onClick(event: MouseEvent) {
            let input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = (event: Event) => {
                let files = (event.target as HTMLInputElement).files;
                if (files && files.length > 0) {
                    this.$emit('file-dropped', files[0]);
                }
            }
            input.click();
        }
    }
})
</script>
<template>
    <div class="image-selector" :class="{ 'drag-file-over': hovering }" @dragover="onDragOver" @dragleave="onDragLeave" @drop="onDrop" @click="onClick">
        <div class="image-selector-inner">
            <div>Click To Select Image</div>
            <div>(or drag and drop)</div>
        </div>
    </div>
</template>
<style lang="scss" scoped>
.image-selector {
    flex-grow: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    background: white;
    transition: background-color 0.1s;
    &.drag-file-over {
        background: silver;
    }
    .image-selector-inner {
        display: flex;
        flex-direction: column;
        align-items: center;
        border: 2px dashed gray;
        padding: 20px;
        cursor: pointer;
        user-select: none;
        >div {
            margin: 5px 0;
        }
    }
}
</style>