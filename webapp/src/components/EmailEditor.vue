<script setup lang="ts">
import Quill from 'quill';
import { Ref, onMounted, ref, watch } from 'vue';
const props = defineProps(["modelValue"]);
const editor = ref(null) as any as Ref<HTMLDivElement>;
const toolbar = ref(null) as any as Ref<HTMLDivElement>;
const emit = defineEmits(["update:modelValue", "editor"]);
import "quill/dist/quill.snow.css";

console.log("email eidtor")
let quill: Quill;
onMounted(() => {
    quill = new Quill(editor.value, {
        theme: 'snow',
        modules: {
            toolbar: [
                ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
                ['blockquote', 'code-block'],
                ['link', 'image', 'video', 'formula'],
                [{ 'header': 1 }, { 'header': 2 }],               // custom button values
                [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'list': 'check' }],
                [{ 'script': 'sub' }, { 'script': 'super' }],      // superscript/subscript
                [{ 'indent': '-1' }, { 'indent': '+1' }],          // outdent/indent
                [{ 'direction': 'rtl' }],                         // text direction
                [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
                [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
                [{ 'font': [] }],
                [{ 'align': [] }],
                ['clean']                                         // remove formatting button
            ]
        },
    });
    watch(() => props.modelValue, (val) => {
        if (JSON.stringify(val) !== JSON.stringify(quill.getContents())) {
            quill.setContents(val);
        }
    }, { deep: true, immediate: true });
    quill.on('text-change', () => {
        emit("update:modelValue", quill.getContents());
    });
    emit("editor", quill);
});


</script>
<template>
    <div class="email-editor-component">
        <div class="editor" ref="editor"></div>
    </div>
</template>
<style lang="scss">
.email-editor-component {
    .editor {
        border: 1px solid gray;
    }
}
</style>
