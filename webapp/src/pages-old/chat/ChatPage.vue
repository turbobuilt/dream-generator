<script lang="ts">
import { handleHttpError } from '@/lib/handleHttpError';
import { store } from '@/store';
import axios from 'axios';
import { reactive } from 'vue';
import { defineComponent } from 'vue';
import markdownit from 'markdown-it'
import Markdown from './Markdown.vue';
import ChatModelSelector from './components/ChatModelSelector.vue';
const md = markdownit()

export default defineComponent({
    components: { Markdown, ChatModelSelector },
    data() {
        return {
            model: "",
            inputText: "",
            messages: [
                // { id: 0, content: "```python\nprint('yeshua loves you')\n```", role: 'user', source: 'local' }
            ],
            error: "",
            waitingForResponse: false
        }
    },
    methods: {
        async sendMessage() {
            this.error = "";
            if (!this.model) {
                this.error = "Models loading...";
                return;
            }
            if (!store.authenticatedUser || !store.authenticatedUser.plan) {
                (this.$root as any).showRegisterModal();
                return;
            }
            if (this.waitingForResponse)
                return;
            let chatMessagesContainer = document.querySelector('.chat-messages');
            let app = this;
                let isAtBottom = chatMessagesContainer.scrollTop + chatMessagesContainer.clientHeight >= chatMessagesContainer.scrollHeight;
            this.messages.push({ id: this.messages.length + 1, content: this.inputText, role: 'user', source: 'local' });
            this.inputText = "";
            if (isAtBottom)
                app.$nextTick(() => setTimeout(_ =>  chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight,0));
            try {
                this.waitingForResponse = true;
                const response = await fetch('/api/post-ai-chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'AuthorizationToken': store.token
                    },
                    body: JSON.stringify({
                        messages: this.messages,
                        model: this.model,
                    })
                });
                if (response.status == 400) {
                    let body = await response.json();
                    if (body.code == "insufficient_credits") {
                        this.error = "Insufficient credits. Please upgrade your plan.";
                        return;
                    }
                }
                if (!response.ok) {
                    let text = await response.text();
                    console.error(text)
                    this.error = "Error: " + text;
                    throw new Error("Failed to send message: " + text);
                }
                // To recieve data as a string we use TextDecoderStream class in pipethrough
                const reader = response.body.pipeThrough(new TextDecoderStream()).getReader()
                let newMessage = reactive({ id: this.messages.length + 1, content: "", source: 'remote', role: 'assistant' });
                this.messages.push(newMessage);

                // @ts-ignore
                function processData(data: string) {
                    // allow 15 px buffer
                    let isAtBottom = chatMessagesContainer.scrollTop + chatMessagesContainer.clientHeight >= chatMessagesContainer.scrollHeight - 15;
                    if (data[0] == "d") {
                        var spaceIndex = data.indexOf(" ");
                        var length = parseInt(data.substring(1, spaceIndex));
                        newMessage.content += data.substring(spaceIndex + 1, spaceIndex + 1 + length);
                        data = data.substring(spaceIndex + 1 + length);
                        if (data) {
                            processData(data);
                        }
                        if (isAtBottom)
                            app.$nextTick(() => setTimeout(_ =>  chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight,0));
                    } else if (data[0] == "e") {
                        try {
                            let userData = JSON.parse(data.slice(2));
                            store.authenticatedUser.creditsRemaining = userData.creditsRemaining;
                        } catch (err) {
                            console.error("Error parsing JSON: " + err);
                        }
                    }
                }
                while (true) {
                    const { value, done } = await reader.read();
                    if (done)
                        break;
                    processData(value);
                    // if (value[0] == "d") {
                    //     newMessage.content += value.slice(2)
                    // } else if (value[0] == "e") {
                    //     let userData = JSON.parse(value.slice(2));
                    //     store.authenticatedUser.creditsRemaining = userData.creditsRemaining;
                    // }
                }
            } catch (err) {
                handleHttpError(err, "Sending message");
            } finally {
                this.waitingForResponse = false;
            }
        }
    }
});
</script>
<template>
    <div class="chat-page">
        <div class="header">
            <!-- <h1>Chat</h1> -->
            <ChatModelSelector v-model="model" />
        </div>
        <div class="chat-page">
            <div class="current-chat-container">
                <div class="chat-messages">
                    <div v-for="message in messages" :key="message.id" :class="{ 'local': message.source === 'local' }" class="chat-message">
                        <Markdown v-model="message.content" />
                    </div>
                </div>
                <div class="main-input">
                    <div class="input">
                        <v-textarea class="main-textarea" @keydown.tab.prevent="sendMessage" v-model="inputText" :rows="1" :auto-grow="true" :hide-details="true" :autofocus="true" />
                        <button @click="sendMessage()">Send</button>
                    </div>
                    <div v-if="error" class="error">{{ error }}</div>
                    <div class="info">Push TAB key to send</div>
                </div>
            </div>
        </div>
    </div>
</template>
<style lang="scss">
.chat-page {
    padding-top: 15px;
    flex: 1;
    display: flex;
    flex-direction: column;
    .error {
        color: red;
        text-align: center;
        padding: 5px;
    }
    .header {
        display: flex;
        align-items: center;
        justify-content: center;
        h1 {
            margin: 0;
            margin-right: 10px;
        }
    }
    .current-chat-container {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
    }
    .chat-messages {
        flex-grow: 1;
        flex-basis: 0;
        overflow-y: auto;
        >div {
            text-align: center;
            padding: 4px;
            // background: whitesmoke;
            // border-bottom: 1px solid gainsboro;
            &.local {
                font-size: 14px;
            }
        }
        overflow-y: auto;
    }
    h1 {
        text-align: center;
    }
    .main-textarea {
        border-radius: 6px;
        background: white;
        overflow: hidden;
        margin-right: 8px;
    }
    .current-chat-container {
        position: relative;
        flex-grow: 1;
        .main-input {
            // position: absolute;
            // bottom: 0;
            // left: 0;
            // width: 100%;
            padding: 10px;
            background: rgb(186, 182, 174);
            input {
                background: white;
            }
        }
    }
    .chat-page {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        >.history-container {
            width: 300px;
            border: 1px solid gray;
        }
        >.current-chat {
            flex-grow: 1;
        }
    }
    .main-input {
        display: flex;
        flex-direction: column;
        .info {
            text-align: center;
            line-height: 1;
            margin-top: 7px;
            font-size: 12px;
        }
        .input {
            display: flex;
            >button {
                padding: 10px 20px;
                font-size: 16px;
                background: rgb(33, 150, 243);
                color: white;
                border: none;
                cursor: pointer;
                border-radius: 5px;
            }
        }
    }
}
</style>