<script lang="ts" setup>
import { defineComponent, onMounted, onBeforeUnmount, ref } from 'vue';

const itemDisplay = ref(null);
const props = defineProps<{ index: number, top: number }>();


const emit = defineEmits(['resize', 'mounted']);
let resizeObserver;
let currentHeight = 0;

onMounted(() => {
    // emit('mounted');
    resizeObserver = new ResizeObserver(entries => {
        let oldHeight = currentHeight;
        currentHeight = entries[0].contentRect.height;
        if (oldHeight !== currentHeight) {
            emit('resize', { oldHeight, currentHeight });
        }
    });
    if (itemDisplay.value) {
        resizeObserver.observe(itemDisplay.value);
    }
});

onBeforeUnmount(() => {
    if (resizeObserver && itemDisplay.value) {
        resizeObserver.unobserve(itemDisplay.value);
    }
});
</script>
<template>
    <div class="item-display" ref="itemDisplay"  v-bind="{ index }" :style="{ transform: `translateY(${props.top}px)`, zIndex: props.top !== undefined ? 1 : -1 }">
        <slot></slot>
    </div>
</template>
<style lang="scss">
.item-display {
    display: flex;
    flex-direction: column;
}
</style>