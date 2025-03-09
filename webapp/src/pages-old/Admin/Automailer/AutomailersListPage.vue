<script setup lang="ts">
import { handleHttpError } from '@/lib/handleHttpError';
import axios from 'axios';
import { reactive } from 'vue';
import { onMounted } from 'vue';
import AdminAutomailerPage from "./AutomailerPage.vue"


const d = reactive({
    automailers: [],
    page: 1,
    gettingItems: false,
});
onMounted(() => {
    getAutomailers();
});
async function getAutomailers() {
    try {
        if (d.gettingItems) return;
        d.gettingItems = true;
        let response = await axios.get(`/api/get-automailers`);
        d.automailers = response.data.items;
    } catch (err) {
        handleHttpError(err, "");
    } finally {
        d.gettingItems = false;
    }
}
</script>
<template>
    <div class="admin-edit-automailers-page">
        <h1>Automailers <v-btn size="small" :to="`/admin/automailer/new`">New</v-btn></h1>
        <v-card v-for="automailer in d.automailers" :key="automailer.id" :to="`/admin/automailer/${automailer.id}`">
            <v-card-text>{{automailer.name}} - {{ automailer.startTrigger }}</v-card-text>
        </v-card>
    </div>
</template>
<style lang="scss">
.admin-edit-automailers-page {
    padding: 10px;
    h1 {
        
    }
    .v-card {
        margin-bottom: 10px;
    }
}
</style>