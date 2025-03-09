<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    props: ["url"]
})
</script>
<template>
    <div class="image-display">
        <div class="bg-image" :style="{ backgroundImage: `url(${url})` }"></div>
        <img :src="url" />
    </div>
</template>
<style lang="scss">
.image-display {
    position: relative;
    display: flex;
    justify-content: center;
    overflow: hidden;
    .bg-image {
        $blurRadius:16px;
        position: absolute;
        top: -$blurRadius;
        left: -$blurRadius;
        right: -$blurRadius;
        bottom: -$blurRadius;
        background-position: center;
        background-size: cover;
        filter: blur($blurRadius);
        -webkit-filter: blur($blurRadius);
    }
    img {
        max-width: 100%;
        z-index: 1;
    }
}
</style>
    