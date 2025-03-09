<template>
    <div>
        <textarea
            v-model="content"
            :placeholder="placeholder"
            :style="{ height: textareaHeight + 'px', color: placeholderColor }"
            @input="resizeTextarea"
            ref="textarea"></textarea>
    </div>
</template>

<script>
export default {
    name: 'ResizableTextarea',
    props: {
        modelValue: {
            type: String,
            default: ''

        },
        placeholder: {
            type: String,
            default: 'Enter text here...'

        },
        placeholderColor: {
            type: String,
            default: '#999'

        }
    },
    data() {
        return {
            content: this.modelValue,
            textareaHeight: 0

        };
    },
    watch: {
        modelValue(newValue) {
            this.content = newValue;
            this.$nextTick(this.resizeTextarea);

        }
    },
    mounted() {
        this.resizeTextarea();

    },
    methods: {
        resizeTextarea() {
            const textarea = this.$refs.textarea;
            textarea.style.height = 'auto';
            textarea.style.height = textarea.scrollHeight + 'px';
            this.textareaHeight = textarea.scrollHeight;
            this.$emit('update:modelValue', this.content);

        }
    }
};
</script>

<style scoped>
textarea {
    width: 100%;
    box-sizing: border-box;
    overflow: hidden;
    resize: none;
    line-height: 1.5;
    padding: 8px;
    font-size: 16px;
}
</style>