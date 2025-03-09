<script lang="ts" setup>
import { showHttpErrorIfExists } from '@/lib/handleHttpError';
import { serverMethods } from '@/serverMethods';
import { store } from '@/store';
import { showAlert, showConfirm, showModal } from '@/ui-elements/ShowModal/showModal';
import SelectReportPostReasonModal from "./SelectReportPostReasonModal.vue";
import { reactive } from 'vue';


let props = defineProps(["share"]);
let emit = defineEmits(["close"]);

const d = reactive({
    loading: false
})

async function showBlockUserModal() {
    let result = await showConfirm({
        title: 'Block user',
        content: 'Are you sure you want to block this user?',
    });
    if (!result) {
        return;
    }
    let data = await serverMethods.postBlockAuthenticatedUser({ authenticatedUserId: props.share.userId });
    if (await showHttpErrorIfExists(data)) {
        return;
    }
    await showAlert({
        title: 'User blocked',
        content: 'The user has been blocked',
    });
    store.feedViewItems = store.feedViewItems.filter(item => item.authenticatedUser !== props.share.userId);
    emit("close")
}

async function showReportPostModal() {
    let result = await showConfirm({
        title: 'Report post',
        content: 'Are you sure you want to report this post?',
    });
    if (!result) {
        return;
    }
    let reason = await showModal({ component: SelectReportPostReasonModal });
    console.log("reason", reason);
    d.loading = true;
    let data = await serverMethods.reportObjectionableContent({ shareId: props.share.id, reason });
    d.loading = false;
    if (await showHttpErrorIfExists(data)) {
        return;
    }

    store.feedViewItems = store.feedViewItems.filter(item => item.id !== props.share.id);
    await showAlert({
        title: 'Post reported',
        content: 'The post has been reported',
    });
    emit("close")

}
</script>
<template>
    <div class="moderation-modal">
        <template v-if="!d.loading">
            <btn variant="text" @click="showBlockUserModal()">Block user</btn>
            <btn variant="text" @click="showReportPostModal()">Report post</btn>
        </template>
        <div class="loading-container" v-else>
            <v-progress-circular color="primary" indeterminate></v-progress-circular>
        </div>
    </div>
</template>
<style lang="scss">
.moderation-modal {
    border-radius: 25px;
    background: white;
    padding: 15px;
    .loading-container {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 50px;
    }
}
</style>