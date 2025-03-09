<script lang="ts">
import Vue, { defineComponent } from 'vue';
import axios from "axios";
import chevronLeft from "../assets/feather/chevron-left.svg?raw";
import router from '@/router';

export default defineComponent({
    props: ["back"],
    data() {
        return {
            search: "",
            chevronLeft
        }
    },
    mounted() {

    },
    computed: {

    },
    methods: {
        goBack() {
            router.go(-1);
        }
    }
})
</script>
<template>
    <div class="navbar">
        <div @click="goBack()" style="display: flex; align-items: center;" v-touchable class="back-button">
            <div style="display: flex;" v-html="chevronLeft"></div>
            <div>{{ $props.back || "Login" }}</div>
        </div>
    </div>
</template>
<style lang="scss">
.navbar {
    $blue: rgb(23, 152, 245);
    color: $blue;
    stroke: $blue;
    display: flex;
    align-items: center;
    padding: 9px 5px;
    background: white;
    .back-button {
        transition: .1s all;
        user-select: none;
        &.touch {
            opacity: .5;
        }
    }
}
</style>