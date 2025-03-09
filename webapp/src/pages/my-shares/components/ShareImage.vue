<script lang="ts" setup>
import { store } from '@/store';
import { showModal } from '@/ui-elements/ShowModal/showModal';
import { computed } from 'vue';
import { nextTick, reactive } from 'vue';
import { onMounted } from 'vue';
import ManageShare from './ManageShare.vue';
import BottomSheet from '@/ui-elements/BottomSheet.vue';

const props = defineProps<{
    share?: {
        id: number;
        path?: string;
    }
}>();

const d = reactive({
    opacity: 0,
    showingManageShareModal: false,
})

onMounted(() => {
    setTimeout(() => {
        d.opacity = 1;
    }, 100);
    // d.opacity = 1;
});

function shareDeleted() {
    d.showingManageShareModal = false;
    for (let i = 0; i < store.myShares.length; i++) {
        if (store.myShares[i].id === props.share.id) {
            store.myShares.splice(i, 1);
            break;
        }
    }
}

async function showManageShareModal() {
    // let result = await showModal({ component: ManageShare, props: { share: props.share } });
    d.showingManageShareModal = true;
}


</script>
<template>
    <div class="history-image" :style="{ opacity: d.opacity }" @click="showManageShareModal()">
        <div class="image" :style="{ backgroundImage: `url('${store.baseImagePath}${props.share.path}')` }"></div>
        <!-- <div class="prompt" v-if="image">{{ image.prompt }}</div> -->
    </div>
    <BottomSheet v-model="d.showingManageShareModal" :prevent-close="false">
        <ManageShare :share="props.share" @deleted="shareDeleted()" />
    </BottomSheet>
</template>
<style lang="scss">
.history-image {
    cursor: pointer;
    position: relative;
    aspect-ratio: 1/1;
    // width: 33%;
    display: flex;
    position: relative;
    transition: opacity .5s;
    .image {
        width: 100%;
        height: 100%;
        background-size: cover;
    }
    .prompt {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        background: rgba(0, 0, 0, 0.5);
        color: white;
        padding: 5px;
        text-overflow: ellipsis;
        line-height: 1.2;
    }
}
</style>