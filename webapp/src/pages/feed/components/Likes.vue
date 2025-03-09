<script lang="ts" setup>
import { showHttpErrorIfExists } from '@/lib/handleHttpError';
import { serverMethods } from '@/serverMethods';
import { Share } from '@/serverModels/Share';
import { reactive } from 'vue';

const props = defineProps<{
    share: Share & { likesCount: number, liked: boolean }
}>();

const d = reactive({
    loading: false
})

async function likeClicked() {
    if (props.share.liked)
        return;
    console.log('like clicked');
    props.share.liked = true;
    props.share.likesCount++;
    d.loading = true;
    var result = serverMethods.likeShare({ share: props.share.id });
    if (await showHttpErrorIfExists(result)) {
        props.share.likesCount--;
        props.share.liked = false;
    }
}

async function unlikeClicked() {
    if (!props.share.liked)
        return;
    console.log('unlike clicked');
    props.share.liked = false;
    props.share.likesCount--;
    d.loading = true;
    var result = serverMethods.unlikeShare({ share: props.share.id });
    if (await showHttpErrorIfExists(result)) {
        props.share.likesCount++;
        props.share.liked = true;
    }
}

</script>
<template>
    <div class="likes-container">
        <Transition name="fade">
            <btn class="like-btn" @click="likeClicked" v-if="!share.liked">+1</btn>
            <div class="unlike-btn" @click="unlikeClicked" v-else="share.liked">Liked</div>
        </Transition>
        <div class="likes-count">+{{ share.likesCount }}</div>
    </div>
</template>
<style lang="scss">
.likes-container {
    display: flex;
    position: relative;
    .likes-count {
        margin-left: 10px;
    }
    .like-btn {
        padding: 2px 4px;
        min-height: 0;
        font-weight: bold;
        width: auto;
        height: auto;
        display: flex;
        min-width: 0;
        box-shadow: 0 0 3px black;
        // text-decoration: underline;
        // color: $primary;
    }
}
</style>