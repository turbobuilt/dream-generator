<script lang="ts" setup>
import { onMounted } from 'vue';
import { reactive, ref, watch } from 'vue';

const props = defineProps<{
    modelValue: string,
    autofocus?: boolean
}>();

const d = reactive({
    focused: false
});

const emit = defineEmits(['update:modelValue']);
const textArea = ref<HTMLTextAreaElement>(null as any);

function updated($event) {
    emit('update:modelValue', $event.target.value);
}
function resize() {
    textArea.value.style.height = 'auto';
    textArea.value.style.height = textArea.value.scrollHeight + 'px';
}
watch(() => props.modelValue, resize);
onMounted(() => {
    resize();
})

function onFocus() {
    console.log('focus');
    d.focused = true;
}
function onBlur() {
    d.focused = false;
}

onMounted(() => {
    // autofocus
    if (props.autofocus) {
        textArea.value.focus();
    }
})

</script>
<template>
    <div class="auto-grow-text-area">
        <textarea rows="1" ref="textArea" :value="props.modelValue" @input="updated($event)" @focus="onFocus" @blur="onBlur" v-bind="{ autofocus: props.autofocus, ...$attrs }"></textarea>
        <div :class="{ 'visible': d.focused }" class="line-below"></div>
    </div>
</template>
<style lang="scss">
@import "../scss/variables.scss";
.auto-grow-text-area {
    display: flex;
    flex-direction: column;
    position: relative;
    textarea {
        text-align: left;
        resize: none;
        overflow: hidden;
        width: 100%;
        border: none;
        outline: none;
        padding: 0;
        font-size: 16px;
        line-height: 1.5;
        font-family: inherit;
        border-bottom: 1px solid #ccc;
    }
    .line-below {
        height: 2px;
        background-color: $primary;
        width: 100%;
        transition: all 0.3s;
        bottom: 0;
        position: absolute;
        transform: scaleX(0);
        transition: transform 0.1s;
        &.visible {
            transform: scaleX(1);
        }
    }
}
</style>