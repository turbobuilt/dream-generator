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
    async activated() {
        // setTimeout(async () => {
            console.log("focus",this.$refs.mainTextArea);
            for(var i = 0; i < 5; ++i) {
                let boundingRect = this.$refs.mainTextArea.getBoundingClientRect();
                if(boundingRect.width < document.body.clientWidth / 2) {
                    console.log("focus", this.$refs.mainTextArea.querySelector("textarea"));
                    this.$refs.mainTextArea.querySelector("textarea").focus();
                    break;
                }
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        // },550)
    },
    data() {
        return {
            model: "",
            inputText: "",
            store,
            files: [],
            messages: [
                // { id: 0, content: "```python\nprint('yeshua loves you')\n```", role: 'user', source: 'local' }
            ],
            error: "",
            waitingForResponse: false
        }
    },
    methods: {
        filesChanged(event) {
            this.files = Array.from(event.target.files);
            // this.uploadFiles();
        },
        showFileSelect() {
            console.log("showing select")
            let container = this.$refs.fileInputContainer;
            console.log("container", container)
            let input = document.createElement('input');
            input.type = 'file';
            input.multiple = true;
            input.style.display = 'none';
            // png jpeg gif webp
            input.accept = ".png,.jpeg,.jpg,.gif,.webp";
            input.addEventListener('change', this.filesChanged);
            container.appendChild(input);
            input.onclick = function (e) {
                e.stopPropagation();
            }
            input.click();
            container.removeChild(input);
        },
        async sendMessage() {
            this.error = "";
            if (!this.model) {
                this.error = "Models loading...";
                return;
            }
            if (!store.authenticatedUser || store.authenticatedUser.creditsRemaining < 1) {
                // (this.$root as any).showRegisterModal();
                store.showingUpgradeModal = true;
                return;
            }
            if (this.waitingForResponse)
                return;
            let chatMessagesContainer = document.querySelector('.chat-messages');
            let app = this;
            let isAtBottom = chatMessagesContainer.scrollTop + chatMessagesContainer.clientHeight >= chatMessagesContainer.scrollHeight;
            let content = [
                { type: "text", text: this.inputText }
            ] as { type: string, text?: string, image_url?: { url: string } }[];
            if (this.files.length) {
                for (let file of this.files) {
                    content.push({
                        type: "image_url",
                        image_url: {
                            "url": "data:image/png;base64," + await new Promise((resolve, reject) => {
                                let reader = new FileReader();
                                reader.onload = function () {
                                    resolve(reader.result?.toString().split(",")[1]);
                                }
                                reader.onerror = reject;
                                reader.readAsDataURL(file);
                            })
                        },
                    })
                }
            }
            this.messages.push({ id: this.messages.length + 1, content, role: 'user', source: 'local' });
            this.inputText = "";
            this.files = [];
            if (isAtBottom)
                app.$nextTick(() => setTimeout(_ => chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight, 0));
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
                let newMessage = reactive({ id: this.messages.length + 1, content: [{ type: "text", text: ""}], source: 'remote', role: 'assistant' });
                this.messages.push(newMessage);

                // @ts-ignore
                function processData(data: string) {
                    // allow 15 px buffer
                    let isAtBottom = chatMessagesContainer.scrollTop + chatMessagesContainer.clientHeight >= chatMessagesContainer.scrollHeight - 15;
                    if (data[0] == "d") {
                        var spaceIndex = data.indexOf(" ");
                        var length = parseInt(data.substring(1, spaceIndex));
                        newMessage.content[0].text += data.substring(spaceIndex + 1, spaceIndex + 1 + length);
                        data = data.substring(spaceIndex + 1 + length);
                        if (data) {
                            processData(data);
                        }
                        if (isAtBottom)
                            app.$nextTick(() => setTimeout(_ => chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight, 0));
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
        },
        startNewChat() {
            this.messages = [];
            this.$refs.comp.querySelector('textarea').focus();
        }
    }
});
</script>
<template>
    <div class="chat-page" ref="comp">
        <div class="header">
            <!-- <h1>Chat</h1> -->
            <ChatModelSelector v-model="model" />
        </div>
        <div class="chat-page">
            <div class="current-chat-container">
                <div class="chat-messages">
                    <template v-for="message in messages" :key="message.id" >
                        <div class="chat-message" v-for="content in message.content" :class="{ 'local': message.source === 'local' }">
                            <Markdown v-model="content.text" v-if="content.type === 'text'"/>
                            <img v-else-if="content.type === 'image_url'" :src="content.image_url.url" style="max-height: 100px; max-width: 100px;" />
                        </div>
                    </template>
                    <div class="new-chat-button-container">
                        <button class="new-chat-button" @click="startNewChat()">New Chat</button>
                    </div>
                </div>
                <div class="main-input">
                    <div class="input">
                        <v-textarea max-rows="8" ref="mainTextArea" class="main-textarea" @keydown.tab.prevent="sendMessage" v-model="inputText" :rows="1" :auto-grow="true" :hide-details="true" />
                        <button @click="sendMessage()">
                            <div v-if="!waitingForResponse">Send</div>
                            <v-progress-circular v-else indeterminate color="white" size="20" />
                        </button>
                    </div>
                    <div ref="fileInputContainer" @click="showFileSelect()" class="image-select">
                        Attach Image
                    </div>
                    <div v-if="files.length" class="files-list">
                        <div v-for="file in files" :key="file.name" class="file-display">
                            <div class='name'>{{ file.name }}</div>
                            <div class="clear" @click="files = files.filter(f => f !== file)">✖</div>
                        </div>
                    </div>
                    <div v-if="error" class="error">{{ error }}</div>
                    <div v-if="!store.isMobile" class="info">Push TAB key to send</div>
                </div>
            </div>
        </div>
    </div>
</template>
<style lang="scss">
@import "@/scss/variables.scss";
.chat-page {
    padding-top: 15px;
    flex: 1;
    display: flex;
    flex-direction: column;
    .image-select {
        cursor: pointer;
        padding: 5px;
        background: rgb(224, 224, 224);
        text-align: center;
        border-radius: 5px;
        margin-top: 5px;
        display: inline-flex;
        align-self: flex-start;
    }
    .files-list {
        display: flex;
        padding: 5px 0;
        .file-display {
            margin: 5px;
            &:first-child {
                margin-left: 0;
            }
            &:last-child {
                margin-right: 0;
            }
            border-radius: 3px;
            border: 1px solid gray;
            line-height: 1;
            max-width: 200px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            padding: 5px;
            background: whitesmoke;
            display: flex;
            align-items: center;
            .clear {
                cursor: pointer;
                margin-left: 5px;
            }
        }
    }
    pre {
        text-wrap: wrap;
    }
    .new-chat-button-container {
        display: flex;
        justify-content: center;
    }
    .new-chat-button {
        color: $primary;
        background: rgb(224, 224, 224);
        line-height: 1;
        font-size: 14px;
        padding: 5px 11px;
        border-radius: 50px;
    }
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