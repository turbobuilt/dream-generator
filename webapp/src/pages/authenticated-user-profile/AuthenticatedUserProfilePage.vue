<script lang="ts" setup>
import { computed, ref, reactive, onMounted, watch } from 'vue';
import router from "@/router";
import axios from "axios";
import { serverMethods } from "@/serverMethods";
import { showHttpErrorIfExists } from "@/lib/handleHttpError";
import AddFriendButton from './components/AddFriendButton.vue';
import StartVideoCallButton from './components/StartVideoCallButton.vue';
import { store } from '@/store';


const username = computed(() => router.currentRoute.value.params.username);

const d = reactive({
    profile: null,
    loading: false
});

async function getProfile() {
    d.loading = true;
    let result = await serverMethods.getUserProfile({ userName: username.value });
    d.loading = false;
    if (showHttpErrorIfExists(result)) {
        return;
    }
    d.profile = result.profile;
}

// onMounted(() => {
//     getProfile();
// })
watch(() => router.currentRoute.value.params.username, (newVal) => {
    d.profile = null;
    getProfile();
}, { immediate: true })

</script>
<template>
    <div class="authenticated-user-profile" v-if="d.profile">
        <div class="top-info">
            <img v-if="d.profile.picture" :src="`https://images.dreamgenerator.ai/profile-pictures/${d.profile.picture}`" class="profile-pic" />
            <div class="user-name">
                <div>{{ d.profile.userName }}</div>
                <AddFriendButton :profile="d.profile" />
                <div v-if="d.profile.isFriend && d.profile.userName != store.authenticatedUser.userName">
                    <StartVideoCallButton :profile="d.profile" />
                    <router-link class="simple-button" :to="`/chat?authenticatedUserIds=${d.profile.userId}`">Chat</router-link>
                </div>
            </div>
        </div>
    </div>
</template>
<style lang="scss">
.authenticated-user-profile {
    padding: 15px;
    img.profile-pic {
        width: 100px;
        height: 100px;
        border-radius: 50%;
    }
    .top-info {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-bottom: 15px;
    }
    .user-name {
        font-size: 20px;
        font-weight: bold;
        margin-top: 10px;
        display: flex;
        align-items: center;
    }
}
</style>