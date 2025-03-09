<script lang="ts" setup>
import { showHttpErrorIfExists } from '@/lib/handleHttpError';
import { serverMethods } from '@/serverMethods';
import { ClientShare } from '@/serverModels/Share';
import { reactive } from 'vue';
import AutoGrowTextArea from '@/ui-elements/AutoGrowTextArea.vue';
import Likes from '../../feed/components/Likes.vue';
import { mdiMenuRight } from '@mdi/js';

const props = defineProps<{
    share: ClientShare;
    shares: ClientShare[];
    index: number;
}>();

const d = reactive({
    newComment: '',
    saving: false,
    loadingChildren: false
});

async function submitComment() {
    if (d.saving) return;
    d.saving = true;
    let result = await serverMethods.createShare({ text: d.newComment, parent: props.share.id, nudity: null })
    d.saving = false;
    if (await showHttpErrorIfExists(result)) return;
    d.newComment = '';
    result.indentLevel = props.share.indentLevel + 1;
    props.shares.splice(props.index + 1, 0, result);
    if (!props.share.showingChildren) {
        toggleShowingChildren();
    }
}

async function toggleShowingChildren() {
    if (props.share.showingChildren) {
        props.share.showingChildren = false;
        for (let i = props.index + 1; i < props.shares.length; ++i) {
            if (props.shares[i].indentLevel <= props.share.indentLevel)
                break;
            props.shares.splice(i, 1);
            --i;
        }
    } else {
        if (d.loadingChildren) return;
        d.loadingChildren = true;
        let result = await serverMethods.getShareChildren({ share: props.share.id, loadImages: false, levels: 10 });
        d.loadingChildren = false;
        let existingIds = [];
        for (let i = 0; i < props.shares.length; ++i) {
            existingIds.push(props.shares[i].id);
        }
        if (await showHttpErrorIfExists(result)) return;

        // remove any children that are already in the list
        for (let i = 0; i < result.items.length; ++i) {
            let child = result.items[i] as ClientShare;
            if (existingIds.indexOf(child.id) !== -1) {
                result.items.splice(i, 1);
                --i;
            }
        }
        for (let i = result.items.length - 1; i >= 0; --i) {
            let child = result.items[i] as ClientShare;
            child.indentLevel = props.share.indentLevel + 1;
            child.parentItem = props.share;
            props.shares.splice(props.index + 1, 0, child);
        }
        props.share.showingChildren = true;
    }
}
props.share.toggleShowingChildren = toggleShowingChildren;
</script>
<template>
    <div :style="{ marginLeft: share.indentLevel * 10 + 'px' }" class="comment-display">
        <div></div>
        <div style="overflow: hidden;">
            <div class="comment-text" @click="toggleShowingChildren">
                <!-- <div class="more-carat-container"> -->
                <div class="carat-contaner-inner" v-if="share.childCount > 0">
                    <svg class="more-carat" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true" viewBox="10 7 5 10" :class="{ open: share.showingChildren }">
                        <path d="M10,17L15,12L10,7V17Z"></path>
                    </svg>
                </div>
                <!-- </div> -->
                <div>{{ share.text }}</div>
            </div>
            <div style="display: flex; width: 100%; align-items: flex-start;">
                <div style="flex-grow: 1;" class="reply-parent">
                    <AutoGrowTextArea v-model="d.newComment" :rows="1" @keydown.prevent.enter="submitComment" placeholder="Respond" />
                    <btn class="submit-comment-button" @click="submitComment" v-if="d.newComment">
                        <div v-if="d.saving">Saving...</div>
                        <div v-else>Submit</div>
                    </btn>
                </div>
                <Likes :share="share" />
            </div>
        </div>
        <!-- <div v-if="d.loadingChildren" class="children-loading">Loading...</div> -->
    </div>
</template>
<style lang="scss">
.comment-display {
    display: grid;
    grid-template-rows: min-content 1fr;
    // display: flex;
    // flex-direction: column;
    padding-right: 5px;
    .comment-text {
        display: flex;
        align-items: center;
    }
    .children-loading {
        margin-left: 5px;
    }
    // .more-carat {
    //     width: 5px;
    // }
    .carat-contaner-inner {
        padding-left: 4px;
        height: 100%;
        margin-right: 4px;
        fill: rgb(58, 58, 58);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        .more-carat {
            transition: transform 0.2s;
            width: 5px;
            &.open {
                transform: rotate(90deg);
            }
        }
    }
    .submit-comment-button {
        margin-top: 2px;
        height: 26px;
    }
    .auto-grow-text-area {
        flex-grow: 1;
        margin-right: 5px;
    }
}
</style>