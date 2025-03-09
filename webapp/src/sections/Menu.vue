<script lang="ts" setup>
import Vue, { defineComponent } from 'vue';
import axios from "axios";

import { mdiImage, mdiSpeaker, mdiChatOutline, mdiPalette, mdiCloud, mdiCheck, mdiCompassOutline, mdiFormatColorFill, mdiAccountCircleOutline } from "@mdi/js";
import { reactive } from 'vue';

const d = reactive({
    search: "",
    activeIconColor: "blue",
    inactiveIconColor: "gray",
    menuItems: [
        { icon: mdiImage, label: "Imagine", value: "/", id: 0 },
        { icon: mdiFormatColorFill, label: "Remove BG", value: "/remove-background", id: 6 },
        { icon: mdiChatOutline, label: "AI Chat", value: "/ai-chat", id: 1 },
        { icon: mdiSpeaker, label: "AI Voice", value: "/text-to-speech", id: 7 },
        { icon: mdiPalette, label: "AI Edit", value: "/edit-image", id: 3 },
        { icon: mdiCompassOutline, label: "Feed", value: "/feed", id: 4 },
        { icon: mdiCloud, label: "Published", value: "/my-shares", id: 4 },
        { icon: mdiCheck, label: "Account", value: "/account", id: 5 },
        { icon: mdiAccountCircleOutline, label: "Profile", value: "/my-profile", id: 6 },
    ]
})
</script>
<template>
    <div class="bottom-menu">
        <div v-for="item in d.menuItems" :key="item.id" @click="$router.replace(item.value)" v-touchable class="menu-item" :class="{ active: $route.path === item.value }" >
            <v-icon :icon="item.icon" :size="32"></v-icon>
            <div class="label">{{ item.label }}</div>
        </div>
    </div>
</template>
<style lang="scss">
@import "../scss/variables.scss";
.bottom-menu {
    overflow-x: auto;
    display: flex;
    align-items: center;
    background: white;
    z-index: 10;
    .menu-item {
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 4px 6px;
        user-select: none;
        .label {
            font-size: 11px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        transition: all .2s ease;
        $hoverColor: gainsboro;
        &.touch {
            background-color: $hoverColor;
        }
        // @media (min-width: 1024px) {
        //     &:hover {
        //         background-color: $hoverColor;
        //     }
        // }
        svg {
            transition: all .2s ease;
            fill: gray;
        }
        &.active {
            // background-color: red;
            color: $primary;
            svg {
                fill: $primary;
            }
        }
    }
}
</style>