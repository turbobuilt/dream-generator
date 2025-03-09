<script lang="ts" setup>
import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import hljs from 'highlight.js';
import { computed } from 'vue';
import 'highlight.js/styles/default.css';

let props = defineProps(['markdown']);

const marked = new Marked(
  markedHighlight({
    langPrefix: 'hljs language-',
    highlight(code, lang, info) {
      const language = hljs.getLanguage(lang) ? lang : 'plaintext';
      return hljs.highlight(code, { language }).value;
    }
  }), {
    breaks: true,
  }
);

const html = computed(() => marked.parse(props.markdown));

</script>
<template>
  <div v-html="html"></div>
</template>