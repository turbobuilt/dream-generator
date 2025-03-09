<script lang="ts" setup>
import { store } from '../store';
let isIos = navigator.userAgent.match(/ipad|iphone/i);

</script>
<template>
    <div class="header-layout" :class="{ 'is-ios': isIos }">
        <div>{{ store?.authenticatedUser?.id }} {{ store?.authenticatedUser?.userName }}</div>
        <div>{{ store?.authenticatedUser?.creditsRemaining?.toFixed(2) || 0 }} Credits</div>
    </div>
</template>
<style lang="scss">
@import '../scss/variables.scss';
.header-layout {
    flex-shrink: 0;
    height: 30px;
    // linear gradient left to right $primary to $secondary
    background: linear-gradient(to right, $primary, $secondary);
    // &.is-ios {
    //     background: linear-gradient(to bottom, $primary, $secondary-gradient-small);
    // }
    color: white;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 5px;
    z-index: 1;
}
</style>