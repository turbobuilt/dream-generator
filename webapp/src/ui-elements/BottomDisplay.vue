<script lang="ts">
import Vue, { defineComponent } from 'vue';
import axios from "axios";
import { store } from "../store"



export default defineComponent({
    props: [],
    data() {
        return {    
            search: "",
            store
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
    <div class="bottom-display">
        {{  store.bottomDisplayInfo }}
        <!-- <component v-for="item in store.bottomDisplayInfo" :is="item.component" v-bind="item" /> -->
        <slot></slot>
    </div>
</template>
<style lang="scss">
.bottom-display {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 1;
}
</style>