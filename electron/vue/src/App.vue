<script setup lang="ts">
import { computed, reactive } from 'vue';
import Menu from './components/Menu.vue';
import { router } from './lib/router';
import { store } from './store';
import { formatBytes } from './lib/helpers';
import NewUserPage from './pages/new-user/NewUserPage.vue';
router.isReady().then(() => {
    router.push("/audio/remove-noise");
});

const d = reactive({
    showNewUserPage: true
})

const activeDownloads = computed(() => {
    let items = []
    for (let model in store.models) {
        if (store.models[model].downloading) {
            items.push(store.models[model]);
        }
    }
    return items;
});
</script>

<template>
    <div class="app">
        <!-- <NewUserPage v-if="d.showNewUserPage" style="position:fixed;top:0;bottom:0;left:0;right:0;z-index:100;" /> -->
        <Menu></Menu>
        <div class="content" v-if="store.models">
            <router-view style="flex-grow: 1;"></router-view>
            <v-card v-if="activeDownloads.length > 0" class="downloads-container">
                <v-card-text>
                    <div v-for="download in activeDownloads" :key="download.id" class="download-progress-container">
                        <div>
                            <div>{{ download.prettyName }}</div>
                        </div>
                        <div>{{ formatBytes(download.bytesDownloaded) }} / {{ formatBytes(download.downloadContentLength) }}</div>
                        <v-progress-linear :key="download.id" :modelValue="download.bytesDownloaded / download.downloadContentLength * 100"></v-progress-linear>
                    </div>
                </v-card-text>
            </v-card>
        </div>
    </div>
</template>

<style scoped lang="scss">
$spacing: 10px;
html, body {
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    height: 100vh;
    width: 100vw;
}
.content {
    display: flex;
    flex-grow: 1;
    flex-direction: column;
    padding: 10px;
}
.downloads-container {
    background: white;
    margin: $spacing;
    margin-top: 0;
}
.download-progress-container {
    display: flex;
    flex-direction: column;
}
* {
    box-sizing: border-box;
    font-family: 'Roboto', sans-serif;
}
html {
    overflow: auto !important;
}
.app {
    display: flex;
    flex-direction: row;
    height: 100vh;
    width: 100vw;
    background-color: #f0f0f0;
    color: #333;
    >.menu {}
    >.content {
        flex-grow: 1;
    }
}
</style>
