<script lang="ts" setup>
import { nextTick } from 'vue';
import { onMounted } from 'vue';
import { reactive } from 'vue';
import { mdiDotsHorizontal, mdiNumericPositive1 } from '@mdi/js';
import { showModal } from '@/ui-elements/ShowModal/showModal';
import ModerationModal from './ModerationModal.vue';
import Likes from './Likes.vue';
import Comments from './Comments.vue';
import { store } from '@/store';
import { ClientShare } from '@/serverModels/Share';
import router from '@/router';

const props = defineProps<{
    share: ClientShare
}>();
const d = reactive({
    starting: true
})

onMounted(() => {
    nextTick(() => {
        d.starting = false;
    })
    // d.starting = false;
})

function showModerationModal() {
    let result = showModal({ component: ModerationModal, props: { share: props.share } })
}

function remix() {
    store.imageRequestSettings.prompt = props.share.text;
    router.replace('/');
}

</script>
<template>
    <div class="share-card">
        <router-link :to="`/share/${share.id}`">
            <img class="main-img" :class="{ loading: !share.dataUrl || d.starting }" :src="`${share.dataUrl}`" />
        </router-link>
        <div class="info-row">
            <router-link class="user-name" :to="`/profile/${share.userName}`">{{ share.userName }}</router-link>
            <div class="spacer"></div>
            <v-icon :icon="mdiDotsHorizontal" class="dots-menu" v-touchable @click="showModerationModal" />
        </div>
        <div class="info-row">
            <Likes :share="share" />
            <div class="spacer"></div>
            <div>Reply With Image</div>
            <div @click="remix">Remix</div>
        </div>
        <Comments :share="share" />
    </div>
</template>
<style lang="scss">
@import '@/scss/variables.scss';
.info-row {
    background: $infoBg;
    color: white;
    height: 35px;
    a {
        color: white;
    }
    display: flex;
    border-top: 1px solid white;
    &:first-child {
        border-top: none;
    }
    >* {
        border-left: 1px solid white;
        white-space: nowrap;
        line-height: 1;
        padding: 4px 6px;
        display: flex;
        align-items: center;
        &:first-child {
            border-left: none;
        }
    }
    .spacer {
        flex-grow: 1;
        // border-left: none !important;
    }
}
.share-card {
    width: 100%;
    margin-bottom: 10px;
    display: flex;
    flex-direction: column;
    a {
        display: flex;
        flex-direction: column;
        justify-content: center;
    }
    .v-icon {
        height: 100% !important;
        width: 30px;
    }
    .user-name {
        color: $primary;
    }
    .main-img {
        transition: opacity .2s;
        opacity: 1;
        width: 100%;
        &.loading {
            opacity: 0;
        }
    }
    .dots-menu {
        cursor: pointer;
        // border-radius: 3px;
        transition: background-color .1s;
        $activeBg: gray;
        &.touch {
            background-color: $activeBg;
        }
        @media (min-width: 1024px) {
            &:hover {
                background-color: $activeBg;
            }
        }
    }
}
</style>