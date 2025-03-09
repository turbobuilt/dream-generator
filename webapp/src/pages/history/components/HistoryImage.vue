<script lang="ts" setup>
import { nextTick, reactive } from 'vue';
import { onMounted } from 'vue';

const props = defineProps<{
    image: {
        url?: string;
        prompt: string;
    };
}>();

const d = reactive({
    opacity: 0
})

onMounted(() => {
    setTimeout(() => {
        d.opacity = 1;
    }, 100);
    // d.opacity = 1;
});
</script>
<template>
    <div class="history-image" :style="{ opacity: d.opacity}">
        <div class="image" :style="{ backgroundImage: `url('${image.url}')` }"></div>
        <div class="prompt">{{ image.prompt }}</div>
    </div>
</template>
<style lang="scss">
.history-image {
    cursor: pointer;
    position: relative;
    aspect-ratio: 1/1;
    // width: 33%;
    display: flex;
    position: relative;
        transition: opacity .5s;
    .image {
        width: 100%;
        height: 100%;
        background-size: cover;
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
}
</style>