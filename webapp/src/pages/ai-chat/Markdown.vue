<script lang="ts">
import { defineComponent } from 'vue';
// import markdownit from 'markdown-it'
// import hljs from 'highlight.js' // https://highlightjs.org
import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import markedKatex from "marked-katex-extension";

import "highlight.js/styles/atom-one-dark.css";
import "./katex.css";
// import hljs from 'highlight.js/lib/core'
import hljs from 'highlight.js/lib/common';

// const md = markdownit({
//     highlight: function (str, lang) {
//         console.log("hgihlighting", str, lang)
//         // if (lang && hljs.getLanguage(lang)) {
//         try {
//             return '<pre><code class="hljs">' +
//                 hljs.highlightAuto(str).value +
//                 '</code></pre>';
//         } catch (__) { }
//         // }

//         return '<pre><code class="hljs">' + md.utils.escapeHtml(str) + '</code></pre>';
//     }
// });
const marked = new Marked(
  markedHighlight({
    langPrefix: 'hljs language-',
    // async: true,
    highlight(code, lang, info) {
        console.log(code, lang, info, "was code lang info")
        // dynamically import lang from highlight.js
        // await import(`highlight.js/lib/languages/${lang}`).then((module) => {
        //     hljs.registerLanguage(lang, module.default);
        // });
        // return hljs.highlight(code, { language: lang }).value;
        // import typescript from 'highlight.js/lib/languages/typescript';
        // hljs.registerLanguage('typescript', typescript);
        //     console.log(hljs.getLanguage(lang), "was language");
      const language = hljs.getLanguage(lang) ? lang : 'plaintext';
      return hljs.highlight(code, { language }).value;
    }
  })
);
const options = {
  throwOnError: false
};
marked.use(markedKatex(options));


export default defineComponent({
    props: ["modelValue"],
    computed: {
        markdown() {
            if (!this.modelValue) return "";
            return marked.parse(this.modelValue);
            // return md.renderInline(this.modelValue);
        }
    }
})
</script>
<template>
    <div class="markdown" v-html="markdown"></div>
</template>
<style lang="scss">
.markdown {
    code {
        text-align: left;
        // if it doesn't have class .hljs, add background
        &:not(.hljs) {    
            background: #dddddd;
            border-radius: 3px;
            padding: 2px;
        }
    }
}
</style>