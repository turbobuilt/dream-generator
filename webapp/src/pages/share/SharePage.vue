<script lang="ts" setup>
import { showHttpErrorIfExists } from '@/lib/handleHttpError';
import router from '@/router';
import { serverMethods } from '@/serverMethods';
import { ClientShare } from '@/serverModels/Share';
import { store } from '@/store';
import { mdiDotsHorizontal, mdiNumericPositive1 } from '@mdi/js';
import { onActivated, ref } from 'vue';
import { nextTick, onMounted } from 'vue';
import { reactive } from 'vue';
import Comments from '../feed/components/Comments.vue';

// const props = defineProps<{
//     share: ClientShare
// }>();

const d = reactive({
    starting: true,
    share: null as ClientShare | null,
    showingImageFullScreen: false
});

function remix() {
    store.imageRequestSettings.prompt = d.share.text;
    router.replace('/');
}

onActivated(() => {
    nextTick(() => {
        d.starting = false;
    })
    if (store.feedViewItems) {
        for (let item of store.feedViewItems) {
            if (item.id == router.currentRoute.value.params.id as any) {
                d.share = item;
                break;
            }
        }
    }
    if (!d.share) {
        getShare();
    }
})

async function getShare() {
    let result = await serverMethods.getShare({ id: router.currentRoute.value.params.id as any });
    console.log(result, "was result");
    if (await showHttpErrorIfExists(result))
        return;
    d.share = Object.assign(d.share || {}, result);
    if (!d.share.dataUrl) {
        // set to empty at first while loading
        d.share.dataUrl = '';
        let imageUrl = store.baseImagePath + d.share.imagePath;
        d.share.dataUrl = URL.createObjectURL(await fetch(imageUrl).then(r => r.blob()));
    }
}

const root = ref<HTMLElement>(null);
</script>
<template>
    <div class="share-page" ref="root" v-scrollable>
        <Transition name="fade">
            <div v-if="d.share" class="share-content">
                <img class="main-img" :class="{ loading: !d.share.dataUrl || d.starting }" :src="`${d.share.dataUrl}`" v-zoomable />
                <div class="info-row">
                    <router-link class="user-name" :to="`/user/${d.share.userId}`">{{ d.share.userName }}</router-link>
                    <div class="spacer"></div>
                    <div class="clickable" @click="remix">Remix</div>
                </div>
                <!-- <div class="info-row">
                    <Likes :share="d.share" />
                    <div class="spacer"></div>
                    <div>Reply With Image</div>
                    <div @click="remix">Remix</div>
                </div> -->
                <Comments :share="d.share" :loadAllChildren="true" />
            </div>
            <div class="loading" v-else>
                <v-progress-circular indeterminate />
            </div>
        </Transition>
    </div>
</template>
<style lang="scss">
@import '@/scss/variables.scss';
.share-page {
    overflow-y: auto;
    .img-bg {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.5);
        z-index: 900;
        transition: .2s all;
    }
    .share-content {
        display: flex;
        flex-direction: column;
    }
    .clickable {
        cursor: pointer;
    }
    .main-img {
        width: 100%;
        height: auto;
        transition: opacity 0.2s;
        &.loading {
            opacity: 0;
            height: 100vw;
        }
    }
    .loading {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 30vh;
    }
}
</style>