<script lang="ts" setup>
import { showHttpErrorIfExists } from '@/lib/handleHttpError';
import router from '@/router';
import { serverMethods } from '@/serverMethods';
import { store } from '@/store';
import { mdiSend, mdiLoading } from '@mdi/js';
import { onBeforeUnmount, onMounted, reactive } from 'vue';

const d = reactive({
    message: "",
    sendingMessage: false,
    messages: []
});

async function getChatMessages() {
    let result = await serverMethods.getChatMessages(parseInt(router.currentRoute.value.query.authenticatedUserIds[0])) as any;
    if (showHttpErrorIfExists(result)) {
        return;
    }
    d.messages = result.items;
}

onMounted(() => {
    getChatMessages();
    store.onChatMessageReceived = (event: { event: string, data: { chatMessage: { authenticatedUser: number }, chatMessageText: { text: string } }, from: string }) => {
        console.log("got message");
        d.messages.push(event.data.chatMessage);
    };
});

onBeforeUnmount(() => {
    store.onChatMessageReceived = null;
});

async function sendMessage() {
    if (!d.message) {
        return;
    }
    d.sendingMessage = true;
    d.messages.push({ created: Date.now() });
    let authenticatedUserIds = [router.currentRoute.value.query.authenticatedUserIds].flat().map(x => parseInt(x));
    let result = await serverMethods.postSubmitTextChatMessage(authenticatedUserIds, d.message);
    d.sendingMessage = false;
    if (showHttpErrorIfExists(result)) {
        d.messages.pop();
        return;
    }
    d.message = "";
}

function formatDate(date) {
    return new Date(date).toLocaleString();
}

</script>
<template>
    <div class="chat-page">
        <div class="chat-history">
            <div v-for="message of d.messages" class="chat-message">
                <div class="message-title">You sent a message</div>
                <div class="message-date">{{ formatDate(message.created) }}</div>
            </div>
        </div>
        <div class="chat-reply-container">
            <v-text-field label="Message" variant="outlined" hide-details="auto" density="compact" v-model="d.message" @keypress.enter="sendMessage()">
                <template v-slot:append-inner>
                    <v-icon :icon="mdiSend" :size="19" @click="sendMessage()" v-if="!d.sendingMessage" />
                    <v-icon :icon="mdiLoading" :size="19" v-else style="animation: spin 1s linear infinite;" />
                </template>
            </v-text-field>
        </div>
    </div>
</template>
<style lang="scss">
.chat-page {
    display: flex;
    flex-direction: column;
    // spin animation
    @keyframes spin {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }
    .chat-message {
        margin-bottom: 10px;
    }
    .message-title {}
    .message-date {
        font-size: 14px;
    }
    .chat-history {
        padding: 5px;
        flex-grow: 1;
        overflow: auto;
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-bottom: 5px;
    }
    .chat-reply-container {
        display: flex;
        padding: 5px;
        align-items: center;
        .v-icon {
            padding: 0px;
            flex-shrink: 0;
        }
    }
}
</style>