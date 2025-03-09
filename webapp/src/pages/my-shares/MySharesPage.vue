<script lang="ts" setup>
import { showHttpErrorIfExists } from '@/lib/handleHttpError';
import { serverMethods } from '@/serverMethods';
import axios from 'axios';
import { onMounted, onUnmounted } from 'vue';
import { reactive } from 'vue';
import HistoryImage from '@/pages/history/components/HistoryImage.vue';
import { store } from '@/store';
import ShareImage from './components/ShareImage.vue';
import BottomSheet from '@/ui-elements/BottomSheet.vue';
import Vue from 'vue'
import { RecycleScroller } from 'vue-virtual-scroller'

// Vue.component('RecycleScroller', RecycleScroller)

const d = reactive({
    page: 1,
    perPage: 10,
    size: 0,
    numCols: 3,
    gap: 5,
    loadingShares: false
});
computeSize();
function computeSize() {
    d.numCols = 3;
    if (window.innerWidth > 768) {
        d.numCols = 5;
    } else if (window.innerWidth > 1024) {
        d.numCols = 7;
    }
    d.size = (window.innerWidth - d.gap * (d.numCols + 1)) / d.numCols;
}


async function mySharesPage() {
    store.myShares = [];
    // /api/my-shares?page=$page&perPage=$perPage
    d.loadingShares = true;
    let result = await serverMethods.myShares({ page: d.page, perPage: d.perPage }) as any;
    d.loadingShares = false;
    if (await showHttpErrorIfExists(result))
        return;
    store.myShares = result.items;
}

onMounted(() => {
    mySharesPage();
    window.addEventListener('resize', computeSize);
});
onUnmounted(() => {
    window.removeEventListener('resize', computeSize);
});
</script>
<template>
    <div class="my-shares-page">
        <div v-if="!store.myShares?.length && !d.loadingShares" class="no-items">
            <div class="no-shares-notice">No shares yet.</div>
            <div>Go to "Imagine" tab, click on an image you've made, and hit "Publish" to share with the community!</div>
        </div>
        <div class="images-grid" :style="{ 'padding-left': `${d.gap}px` }" v-else>
            <ShareImage class="item" v-for="item in store.myShares" :key="item.id" :share="item" />
            <!-- <RecycleScroller class="scroller" :items="store.myShares" :item-size="d.size" key-field="id" v-slot="{ item }">
                <ShareImage class="item" :share="item" :grid-items="d.numCols" />
            </RecycleScroller> -->
        </div>
    </div>
</template>
<style lang="scss">
.my-shares-page {
    display: flex;
    flex-direction: column;
    .no-items {
        padding: 20px 5px;
        display: flex;
        flex-direction: column;
        // justify-content: center;
        align-items: center;
        text-align: center;
        .no-shares-notice {
            margin-bottom: 15px;
            font-weight: bold;
        }
    }
}
</style>