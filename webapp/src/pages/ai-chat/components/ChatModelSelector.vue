<script lang="ts" setup>
import { reactive, } from 'vue'
import axios from "axios";
import { computed } from 'vue';

// props
const props = defineProps(["modelValue"])
const emit = defineEmits(["update:modelValue"])

var models = reactive(null as any | null);
axios.get("/api/get-chat-models").then(value => {
    models = reactive(value.data);
    emit("update:modelValue", Object.keys(models)[0]);
})
function updated(event) {
    emit("update:modelValue", event.currentTarget.value);
}
</script>
<template>
    <select class="chat-model-selector" :modelValue="props.modelValue" @change="updated" v-if="models">
        <option v-for="(info, modelId) in models" :value="modelId">{{ info.label }} ({{ (info.outputTokenCost*1000).toFixed(2) }} credits / 1000 tokens)</option>
    </select>
</template>
<style lang="scss">
.chat-model-selector {
    border: 1px solid silver;
    line-height: 1;
    padding: 5px;
    border-radius: 4px;
    cursor: pointer;
    transition: .1s all;
    &:hover {
        background: #f0f0f0;
    }
    &:active, &:focus {
        outline: none;
    }
}
</style>
