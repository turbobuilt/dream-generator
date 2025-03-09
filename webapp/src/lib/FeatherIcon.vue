<script lang="ts" setup>
import { defineProps } from 'vue';
// code to import ../assets/feather/x.svg
import x from "../assets/feather/x.svg?raw";
import check from "../assets/feather/check.svg?raw";
let props = defineProps(["icon"]);

var icons = {
    x: x,
    check: check
}

</script>
<template>
    <div class="feather-icon" v-html="icons[icon]"></div>
</template>
<style lang="scss">
.feather-icon {
    display: flex;
}
</style>