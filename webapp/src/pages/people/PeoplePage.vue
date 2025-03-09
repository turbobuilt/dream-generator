<script lang="ts" setup>
import { reactive } from 'vue';
import { serverMethods } from "@/serverMethods";
import { showHttpErrorIfExists } from '@/lib/handleHttpError';
import { mdiAccountCircleOutline } from '@mdi/js';

const d = reactive({
    search: '',
    searching: false,
    page: 1,
    perPage: 15,
    results: [],
})

async function searchPeople() {
    if(!d.search) {
        return;
    }
    console.log('searchPeople');
    d.searching = true;
    let result = await serverMethods.postSearchPeople(d.search, { page: d.page, perPage: d.perPage });
    d.searching = false;
    if (showHttpErrorIfExists(result)) {
        return;
    }
    d.results = result.items;
}
</script>
<template>
    <div class="people-page">
        <v-text-field label="Search By UserName" outlined @click="searchPeople()" v-model="d.search" @keypress.enter="searchPeople()" hide-details="auto"/>
        <div class="people-results">
            <router-link v-for="result of d.results" class="result" :to="`/profile/${result['userName']}`">
                <img class="profile-pic" :src="`https://images.dreamgenerator.ai/profile-pictures/${result['pictureGuid']}`" v-if="result['pictureGuid']"/>
                <div class="profile-pic" style="display: flex;justify-content: center;align-items: center;" v-else>
                    <!-- <v-icon :icon="mdiAccountCircleOutline" :size="25"/> -->
                </div>
                <div>{{ result['userName'] }}</div>
            </router-link>
        </div>
    </div>
</template>
<style lang="scss">
.people-page {
    .v-text-field {
        flex-grow: 0;
    }
    .people-results {
        overflow: auto;
    }
    .people-results {
        padding: 10px 10px;
    }
    .result {
        text-decoration: none;
        color: black;
        display: flex;
        align-items: center;
        margin-bottom: 15px;
        .profile-pic {
            $size: 40px;
            border: 2px solid gray;
            background: gainsboro;
            width: $size;
            height: $size;
            border-radius: $size;
            margin-right: 10px;
        }
    }
}
</style>