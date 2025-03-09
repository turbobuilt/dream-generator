<script lang="ts" setup>
import { reactive } from 'vue';
import { store } from "@/store";
import { watchEffect } from 'vue';
import { watch } from 'vue';

const d = reactive({
    currentItem: null,
    previousItem: null
})

let currentStack = []
watch(store.navStack, (newVal, oldVal) => {
    console.log("nav stack changed");
    d.previousItem = d.currentItem;
    d.currentItem = newVal[newVal.length - 1];
    // d.currentItem = newVal[newVal.length - 1];
    // d.previousItem = oldVal[oldVal.length - 1];
    // currentStack = newVal.slice();
}, { deep: true });
</script>
<template>
    <!-- <div class="nav-render"> -->

    <component :is="d.currentItem" class="nav-item" ref="currentItem" />
    <component :is="d.previousItem" class="nav-item" ref="previousItem" />
    <!-- <div class="nav-item"></div> -->
    <!-- </div> -->
</template>
<style lang="scss">
.nav-render {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
}
.nav-item {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
}
</style>