<script lang="ts" setup>
import { serverMethods } from "@/serverMethods";
import { showHttpErrorIfExists } from "@/lib/handleHttpError";
import { defineProps, reactive, ref, onMounted } from "vue";
import { showAlert, showConfirm, showPrompt } from '@/ui-elements/ShowModal/showModal';
import { store } from "@/store";

const props = defineProps(["profile"]);

const d = reactive({
    available: false
});

async function checkIfIsAvailable() {
    let result = await serverMethods.postCheckIfUserIsAvailableForVideo({ userId: props.profile.userId });
    if (showHttpErrorIfExists(result)) {
        return;
    }
    d.available = result.available;
}
onMounted(() => {
    checkIfIsAvailable();
});

async function startVideoCall() {
    store.currentVideoChat = {
        recipients: [props.profile.userId],
        callRoom: null
    }
}
</script>
<template>
    <div class="simple-button start-video-call-button" v-touchable @click="startVideoCall()" v-if="d.available">
        Start video call
    </div>
</template>
<style lang="scss">
.start-video-call-button {

}
</style>