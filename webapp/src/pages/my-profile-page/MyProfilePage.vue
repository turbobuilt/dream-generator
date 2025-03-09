<script lang="ts" setup>
import { callMethod } from "@/lib/callMethod";
import { showHttpErrorIfExists } from "@/lib/handleHttpError";
import { serverMethods } from "@/serverMethods";
import { store } from "@/store";
import { showAlert, showConfirm, showPrompt } from '@/ui-elements/ShowModal/showModal';

async function setUserName() {
    // showAlert("Feature coming soon") 
    let newName = await showPrompt({ title: "New Username", content: "Please choose your username" });
    console.log("new name is", newName)
    // let result = await callMethod("saveUserName", { userName: newName });
    let result = await serverMethods.saveUserName({ userName: newName })
    if (showHttpErrorIfExists(result)) return;
    store.authenticatedUser.userName = newName;
}
</script>
<template>
    <div class="my-profile-page">
        <!-- <img v-if="store.authenticatedUser.pro" :src="`https://images.dreamgenerator.ai/profile-pictures/${store.authenticatedUser.picture}`" class="profile-pic" /> -->
        <!-- <div>Your Username</div> -->
        <div class="user-name" @click="setUserName">{{ store.authenticatedUser.userName || "Set UserName" }}</div>
    </div>
</template>
<style lang="scss">
.my-profile-page {
    padding: 15px;
    display: flex;
    flex-direction: column;
    align-items: center;
    .user-name {
        cursor: pointer;
        font-weight: bold;
    }
}
</style>