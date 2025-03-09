<script setup lang="ts">
import { defineProps } from 'vue'
import MarkdownDisplay from './MarkdownDisplay.vue'
const props = defineProps(['messages']);
const emits = defineEmits(["reset"])


async function deleteMessage(id: number, index) {
    console.log("deleteMessage", id, index);
    props.messages.splice(index, 1);
}

async function reset() {
    emits("reset");
}

</script>
<template>
    <div class="chat-messages-component">
        <div v-for="message, index of props.messages" :key="index">
            <div class="message" :class="[message.role]">
                <MarkdownDisplay :markdown="message.content" />
                <div class="delete-message-button">
                    <v-icon @click="deleteMessage(message.id, index)">mdi-minus</v-icon>
                </div>
            </div>
        </div>
        <div class="clear-chats-button-container" v-if="messages.length">
            <div class="clear-chats-button" @click="reset">Start Over</div>
        </div>
    </div>
</template>
<style lang="scss">
.chat-messages-component {
    flex-grow: 1;
    flex-shrink: 1;
    flex-basis: 0;
    overflow: auto;
    .clear-chats-button-container {
        display: flex;
        justify-content: center;
        padding: 10px;
        .clear-chats-button {
            line-height: 1;
            padding: 5px 10px;
            border: 1px solid silver;
            border-radius: 100px;
            cursor: pointer;
            transition: .1s all;
            &:hover {
                background: #f0f0f0;
            }
        }
    }
    li {
        list-style: inside
    }
    .message {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        padding: 7px 15px;
        pre {
            overflow: hidden;
            white-space: pre-wrap;
        }
        .delete-message-button {
            opacity: 0;
            transition: .1s all;
            padding: 3px;
            border-radius: 3px;
            &:hover {
                background: gainsboro;
            }
        }
        &:hover {
            .delete-message-button {
                opacity: 1;
            }
        }
        p {
            padding: 3px 0;
        }
        &.user {
            border-bottom: 1px solid silver;
            border-top: 1px solid silver;
        }
    }
}
</style>