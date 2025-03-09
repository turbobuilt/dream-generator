<script lang="ts" setup>
import { computed, reactive } from "vue";
import licenses from "./licenses.json";
import { router } from "../../lib/router";

const d = reactive({
    licenses: licenses
});

const licenseInfo = computed(() => {
    for (let license of d.licenses) {
        console.log(router.currentRoute.value.params.packageName);
        if (license.packageName === router.currentRoute.value.params.packageName) {
            return license;
        }
    }
    return { license: "License not found", packageName: router.currentRoute.value.params.packageName };
});


</script>
<template>
    <div class="license-page">
        <v-card>
            <v-card-title>{{ licenseInfo.packageName }}</v-card-title>
            <v-card-text>
                <div v-html="licenseInfo.license" class="license-text"></div>
            </v-card-text>
        </v-card>
    </div>
</template>
<style>
.license-page {
    .v-card {
        margin: 10px;
    }
}
</style>