<script lang="ts" setup>
import { showHttpErrorIfExists } from '@/lib/handleHttpError';
import { serverMethods } from '@/serverMethods';
import { ClientShare, Share } from '@/serverModels/Share';
import AutoGrowTextArea from '@/ui-elements/AutoGrowTextArea.vue';
import { computed, onMounted, reactive } from 'vue';
import Likes from './Likes.vue';
import CommentDisplay from '@/pages/share/components/CommentDisplay.vue';
import { watch } from 'vue';
import { watchEffect } from 'vue';

const props = defineProps<{
    share: ClientShare,
    loadAllChildren?: boolean
}>();

const d = reactive({
    newComment: '',
    saving: false,
    gettingChildren: false,
    children: [] as ClientShare[]
})

onMounted(() => {
    if (props.loadAllChildren || !props.share.children) {
        getChildren();
    }
});

async function submitComment(event) {
    if (d.saving) return;
    // if shift is down, return
    if (event.shiftKey) return;
    d.saving = true;
    let result = await serverMethods.createShare({ text: d.newComment, parent: props.share.id, nudity: null })
    d.saving = false;
    if (await showHttpErrorIfExists(result)) return;
    d.newComment = '';
    props.share.children.unshift(result);
}

async function getChildren() {
    d.gettingChildren = true;
    let result = await serverMethods.getShareChildren({ share: props.share.id, loadImages: true, levels: 10 });
    d.gettingChildren = false;
    if (await showHttpErrorIfExists(result))
        return;
    props.share.children = result.items;
}

const commentsToShow = computed(() => {
    if (!props.share.children)
        return [];
    let indentLevel = 0;
    let parentIds = [props.share.id];
    let parents: ClientShare[] = [props.share];
    props.share.showingChildren = true;
    let commentsToShow = []
    for (let i = 0; i < props.share.children.length; ++i) {
        let child = props.share.children[i];
        if (parentIds.indexOf(child.parent) === -1) {
            parentIds.push(child.parent);
            parents.push(props.share.children[i - 1])
            indentLevel++;
        } else if (parentIds.at(-1) !== child.parent) {
            parentIds.pop();
            parents.pop();
            indentLevel--;
        }
        let parentItem = parents.at(-1);
        child.parentItem = parentItem;
        child.indentLevel = indentLevel;
        // parentItem.children = parentItem.children || [];
        // parentItem.children.push(child);
        // if (child.parentItem.showingChildren) {
        commentsToShow.push(child);
        // }
    }

    return commentsToShow;
});

async function addCommentFocused(event) {
    console.log('addCommentFocused', event.target);
    let replyParent = event.target.closest('.reply-parent');
    let button = replyParent.querySelector('.submit-comment-button');
    if (button) {
        button.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}
</script>
<template>
    <div class="comments-section" @focusin="addCommentFocused">
        <TransitionGroup name="gridheight" tag="div">
            <template v-for="child, index in commentsToShow" :key="child.id">
                <CommentDisplay :style="{ marginLeft: child.indentLevel * 8 + 'px' }" :share="child" :shares="props.share.children" :index="index" />
            </template>
        </TransitionGroup>
        <div class="reply-parent">
            <AutoGrowTextArea placeholder="Write a comment..." v-model="d.newComment" :rows="1" @keydown.enter="submitComment" />
            <btn @click="submitComment" v-if="d.newComment" class="submit-comment-button">
                <span v-if="d.saving">Saving...</span>
                <span v-else>Comment</span>
            </btn>
        </div>
    </div>
</template>
<style lang="scss">
.comments-section {
    padding: 2px 5px;
    .submit-comment-button {
        margin-top: 5px;
    }
}
</style>