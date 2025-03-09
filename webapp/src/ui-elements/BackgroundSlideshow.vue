
<script lang="ts">
import Vue, { defineComponent } from 'vue';
import axios from "axios";

export default defineComponent({
    props: ["imagePaths"],
    data() {
        return {
            search: "",
            currentIndex: 0,
            animationDuration: 500,
            imageDuration: 300000,
            activeItem: null
        }
    },
    mounted() {
        // set initial bgImage
        // set parent element z-index to 1
        this.$parent.$el.style.zIndex = 1;
        this.$refs.image1.style.backgroundImage = `url(${this.imagePaths[0]})`;
        this.activeItem = this.$refs.image1;
        // fade from one image to another
        function swapImages() {
            console.log("swapping images", this);
            this.currentIndex = (this.currentIndex + 1) % this.imagePaths.length;
            let inactiveItem = this.activeItem === this.$refs.image1 ? this.$refs.image2 : this.$refs.image1;
            inactiveItem.style.backgroundImage = `url(${this.imagePaths[this.currentIndex]})`;
            this.activeItem.style.opacity = 0;
            inactiveItem.style.opacity = 1;
            this.activeItem = inactiveItem;
        }
        swapImages.call(this);
        setInterval(swapImages.bind(this), this.imageDuration);
    },
    computed: {

    },
    methods: {

    }
})
</script>
<template>
    <div class="background-slideshow">
        <div ref="image1"></div>
        <div ref="image2"></div>
    </div>
</template>
<style lang="scss">
.background-slideshow {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: -1;
    * {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        transition: opacity 1s;
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
    }
}
</style>