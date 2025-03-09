<script lang="ts">
import Vue, { defineComponent } from 'vue';
import axios from "axios";
import Checkout from '@/sections/checkout/Checkout.vue';
import { store } from '@/store';

export default defineComponent({
    components: { Checkout },
    props: ["modelValue"],
    data() {
        return {
            search: "",
            touchStartLocation: null as null | { x: number, y: number },
            dy: 0,
        }
    },
    mounted() {

    },
    computed: {

    },
    methods: {
    }
})
</script>
<template>
    <bottom-sheet :modelValue="modelValue" @update:modelValue="$emit('update:modelValue', $event)">
        <div class="free-limit-reached-modal">
            <h2>Daily Free Limit Reached</h2>
            <div class="msg">
                <div>Subscribe to help us grow, or wait 24 hours.</div>
                <div style="height: 5px" />
                <div>We don't make enough from ads to cover free images - instead we just do them as a courtesy. Please don't give us bad reviews, we're working on it.</div>
            </div>
            <Checkout :hide-restore="true" />
        </div>
    </bottom-sheet>
</template>
<style lang="scss">
.free-limit-reached-modal {
    h2 {
        text-align: center;
    }
    .msg {
        line-height: 1.1;
    }
}
</style>