<script setup lang="ts">
import { handleHttpError } from '@/lib/handleHttpError';
import router from '@/router';
import axios from 'axios';
import { computed } from 'vue';
import { reactive } from 'vue';
import { onMounted } from 'vue';
import AdminAutomailerEmailPage from "./AutomailerEmailPage.vue"
import { onBeforeMount } from 'vue';
const d = reactive({
    automailer: null,
    page: 1,
    gettingAutomailer: false,
    emails: null,
    saving: false,
    deleting: false,
    currentAutomailerEmail: null as any
});
const props = defineProps(["automailer"]);
const emits = defineEmits(["deleted"])

let id = computed(() => router.currentRoute.value.params.id);

onBeforeMount(() => {
    if (id.value !== "new") {
        getAutomailer();
    } else {
        d.automailer = {}
    }
})
async function getAutomailer() {
    try {
        if (d.gettingAutomailer) return;
        d.gettingAutomailer = true;
        let response = await axios.get(`/api/get-automailer/${id.value}`);
        d.automailer = response.data.item;
        d.emails = response.data.emails;
    } catch (err) {
        handleHttpError(err, "");
    } finally {
        d.gettingAutomailer = false;
    }
}

async function saveAutomailer() {
    try {
        if (d.saving) return;
        d.saving = true;
        let response = await axios.post(`/api/post-automailer`, d.automailer);
        for (let key in d.automailer) {
            delete d.automailer[key];
        }
        Object.assign(d.automailer, response.data.automailer);
        router.replace(`/admin/automailer/${d.automailer.id}`);
    } catch (err) {
        handleHttpError(err, "");
    } finally {
        d.saving = false;
    }
}

async function deleteAutomailer() {
    if (!confirm("Are you sure you want to delete this automailer?")) return;
    try {
        if (d.deleting) return;
        d.deleting = true;
        await axios.delete(`/api/delete-automailer`, { params: { id: d.automailer.id } });
        emits("deleted")
    } catch (err) {
        handleHttpError(err, "");
    } finally {
        d.deleting = false;
    }
}

function newAutomailerEmail() {
    d.currentAutomailerEmail = {
        automailer: d.automailer.id,
        subject: "",
        body: ""
    }
    d.emails.push(d.currentAutomailerEmail);
}
function onDeleted() {
    for (let i = 0; i < d.emails.length; ++i) {
        if (d.emails[i].id == d.currentAutomailerEmail.id) {
            d.emails.splice(i, 1);
            break;
        }
    }
    d.currentAutomailerEmail = null;
}
function sortBySendAt() {
    d.emails.sort((a, b) => a.sendAt - b.sendAt);
}
function closed() {
    d.currentAutomailerEmail = null;
    sortBySendAt();
}
</script>
<template>
    <div class="admin-edit-automailers-page" v-if="d.automailer">
        <div style="display: flex; align-items: center;">
            <h1>Automailer</h1>
            <v-btn @click="saveAutomailer()" >Save</v-btn>
        </div>
        <div>
            <v-text-field v-model="d.automailer.name" label="Name" />
            <!-- veselect startTrigger: ["onStartTrial","onPremiumSubscribe"]-->
            <v-select v-model="d.automailer.startTrigger" :items="['onStartTrial', 'onPremiumSubscribe']" label="Start Trigger" />
        </div>
        <h2>Emails
            <v-btn v-if="d.automailer && d.automailer.id" :to="`/admin/automailer-email/new?automailer=${d.automailer.id}`">New Email</v-btn>
        </h2>
        <router-link v-for="email of d.emails" v-if="d.emails" class="email-row" :to="`/admin/automailer-email/${email.id}`">
            <div>{{ email.subject }}</div>
            <div> {{ email.sendAt / 1000 / 60 / 60 / 24 }}</div>
        </router-link>
    </div>
</template>
<style lang="scss">
.admin-edit-automailers-page {
    .email-row {
        display: flex;
        justify-content: space-between;
        padding: 10px;
        border-bottom: 1px solid #ccc;
        transition: .1s all;
        cursor: pointer;
        &:hover {
            background-color: #f0f0f0;
        }
    }
    padding: 10px;
    .loading-container {
        display: flex;
        justify-content: center;
        padding-top: 10px;
    }
    .save-buttons {
        display: flex;
        justify-content: space-between;
        margin-top: 10px;
        padding: 10px;
    }
    .card-body {
        // padding: 10px;
    }
}
</style>