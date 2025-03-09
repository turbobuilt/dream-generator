<script setup>
import { computed } from 'vue';
import { router } from "../lib/router"

let currentRoute = computed(() => {
    return router.currentRoute.value;
});
</script>
<template>
    <div class="menu">
        <div class="v-card v-theme--light v-card--density-default v-card--variant-elevated">
            <router-link to="/image" class="menu-item" :class="{ active: currentRoute.path === '/images' }">
                <v-icon>mdi-image</v-icon>
                <div>Images</div>
            </router-link>
            <router-link to="/ai-chat-models" class="menu-item" :class="{ active: currentRoute.path === '/ai-chat' }">
                <v-icon>mdi-chat</v-icon>
                <div>Chat</div>
            </router-link>
            <router-link to="/audio" class="menu-item" :class="{ active: currentRoute.path === '/audio' }">
                <v-icon>mdi-microphone</v-icon>
                <div>Audio</div>
            </router-link>
            <v-spacer />
            <router-link to="/info" class="menu-item" :class="{ active: currentRoute.path === '/info' }">
                <v-icon>mdi-information</v-icon>
                <div>Info</div>
            </router-link>
        </div>
    </div>
</template>
<style lang="scss">
.menu {
    $size: 100px;
    width: $size;
    display: flex;
    flex-direction: column;
    color: white;
    font-size: 20px;
    font-weight: bold;
    margin: 10px;
    margin-right: 0;
    .v-card {
        flex-grow: 1;
        display: flex;
        flex-direction: column;
    }
    .menu-item {
        padding: 10px;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        text-decoration: none;
        align-items: center;
        text-align: center;
        justify-content: center;
        height: $size;
        &:hover {
            background-color: #555;
        }
        color: black;
        color: rgb(53, 53, 53);
        font-weight: normal;
        font-size: 23px;
        border-bottom: 1px solid #666;
        &:last-of-type {
            border-bottom: none;
        }
        transition: .1s all;
        &.active {
            background-color: #1591ba;
            color: white;
        }
        &:hover {
            background-color: #7ad2ef;
            // color: white;
        }
    }
}
</style>