<script lang="ts">
import Vue, { defineComponent } from 'vue';
import axios from "axios";
import { store } from '@/store';

export default defineComponent({
    emits: ["close", "update:modelValue"],
    props: ["modelValue", "preventClose", "minHeight", "maxHeight"],
    data() {
        return {
            search: "",
            touchStartLocation: null as null | { x: number, y: number },
            dy: 0,
            scrolledDistanceAtTouchMoveStart: 0,
            store: store
        }
    },
    mounted() {
        this.transformY = 0
    },
    computed: {

    },
    methods: {
        bgClicked() {
            console.log("bg clicked");
            if (this.preventClose)
                return;
            console.log("emitting close");
            this.$emit("close", true);
            this.$emit("update:modelValue", false);
        },
        touchStarted(event) {
            if (this.preventClose)
                return;
            this.touchStartLocation = { x: event.touches[0].clientX, y: event.touches[0].clientY };
            this.scrolledDistanceAtTouchMoveStart = this.$refs.bottomSheet.scrollTop;
        },
        touchMoved(event) {
            event.stopPropagation();
            event.preventDefault();
            if (this.touchStartLocation) {
                let y = event.touches[0].clientY;
                let dy = y - this.touchStartLocation.y;
                this.dy = dy;

                let rawScrollPosition = this.scrolledDistanceAtTouchMoveStart - dy;
                let extra = Math.min(0, rawScrollPosition);
                this.$refs.bottomSheet.scrollTop = rawScrollPosition - extra;

                this.$refs.bottomSheet.style.transition = "none";
                this.$refs.bottomSheet.style.transform = `translateY(${-extra}px) translateX(-50%)`;
            }
        },
        touchEnded() {
            if (this.preventClose)
                return;
            this.touchStartLocation = null;
            // if more that 20% down, close
            if (this.dy > this.$refs.bottomSheet.clientHeight * 0.5) {
                this.$refs.bottomSheet.style.transition = "";
                this.$emit("close", true);
            } else {
                // move back to original
                this.$refs.bottomSheet.style.transition = ".5s all ease";
                this.$refs.bottomSheet.style.transform = `translateY(0px) translateX(-50%)`;
            }
        }
    }
})
</script>
<template>
    <Transition name="fade">
        <div class="bottom-sheet-bg" @click="bgClicked" v-if="modelValue"></div>
    </Transition>
    <Transition :name="store.isMobile ? 'slide-up' : 'bottom-sheet-desktop-fade'">
        <div ref="bottomSheet" class="bottom-sheet x-50" :class="{ desktop: !store.isMobile }" v-if="modelValue" @touchstart="touchStarted" @touchmove="touchMoved" @touchend="touchEnded" @touchcancel="touchEnded" :style="{ 'min-height': ((minHeight || 250 + 'px')), 'max-height': (maxHeight || '90%') }">
            <slot></slot>
        </div>
    </Transition>
</template>
<style lang="scss">
.bottom-sheet-bg {
    // transform: translateY(100%);
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.2);
    z-index: 10;
}
.bottom-sheet {
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    max-height: 90%;
    transition: .5s all ease;
    position: fixed;
    bottom: 0;
    left: 50%;
    overflow: auto;
    transform: translateX(-50%);
    max-width: 100%;
    min-width: 200px;
    width: 100%;
    z-index: 11;
    background: white;
    $borderRadius: 9px;
    border-top-left-radius: $borderRadius;
    border-top-right-radius: $borderRadius;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
    min-height: 250px;
    // padding: 15px;
    &.desktop {
        // on desktop it's a regular modal
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        max-width: 90vw;
        max-height: 90vh;
        border-radius: $borderRadius;
    }
}
</style>