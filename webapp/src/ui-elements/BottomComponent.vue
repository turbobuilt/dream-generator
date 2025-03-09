<script lang="ts">
import Vue, { defineComponent } from 'vue';
import axios from "axios";
import { store } from '../store';

export default defineComponent({
    props: ["component"],
    data() {
        return {    
            search: ""
        }
    },
    mounted() {
        store.bottomDisplayInfo.push(this.props);
    },
    beforeUnmount() {
        store.bottomDisplayInfo = store.bottomDisplayInfo.filter((item) => item !== this.props);
    },
    computed: {

    },
    methods: {

    },
})
</script>
<template>
    
</template>
<style lang="scss">
.bottom-component {

}
</style>