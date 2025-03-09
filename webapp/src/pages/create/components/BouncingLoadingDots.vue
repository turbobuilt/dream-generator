<template>
    <div class="bouncing-loading-dots">
        <div v-for="(dot, index) in dots" :key="index" :class="['dot', `dot-${index}`]"></div>
    </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'BouncingLoadingDots',
    data() {
        return {
            dots: Array(3).fill(null) // Creates an array with 3 null values
        };
    }
});

</script>



<style lang="scss">
@import "@/scss/variables.scss";
$dotSize: 15px;
.bouncing-loading-dots {
    display: flex;
    justify-content: space-around;
    align-items: center;
    width: 100%;
    height: 20px;
    position: relative;
}
.dot {
    width: $dotSize;
    height: $dotSize;
    background-color: $primary;
    border-radius: 50%;
    position: absolute;
    top: 0;
    left: 0;
}
.dot-0 {
    animation: bounce .4s*2 infinite ease-in-out;
}
.dot-1 {
    animation: bounce .6s*2 infinite ease-in-out;
}
.dot-2 {
    animation: bounce 1.2s*2 infinite ease-in-out;
}

// animate left right
@keyframes bounce {
    0%, 100% {
        left: 0;
    }
    50% {
        left: calc(100% - #{$dotSize});
    }
}

</style>