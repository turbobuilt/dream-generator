<script lang="ts" setup>
import { reactive } from "vue";
import licenses from "./licenses.json";

const d = reactive({
    licenses: licenses
});


</script>
<template>
    <div class="licenses-list-page">
        <v-card>
            <v-card-title>Licenses</v-card-title>
            <v-card-text class="licenses-container">
                <router-link class="license" :to="`/license/${license.packageName}`"  v-for="license in d.licenses" :key="license.packageName">
                    <div>{{ license.packageName }}</div>
                </router-link>
            </v-card-text>
        </v-card>
    </div>
</template>
<style lang="scss">
.licenses-list-page {
    .licenses-container {
        display: flex;
        flex-wrap: wrap;
        // background: gainsboro;
    }
    .license {
        margin: 5px;
        background: white;
        padding: 5px;
        &:hover {
            text-decoration: underline;
        }
        width: 100%;
        // border-bottom: 1px solid gray;
        color: black;
        text-decoration: none;

        cursor: pointer
        // width: 33.33%;
    }
}
</style>