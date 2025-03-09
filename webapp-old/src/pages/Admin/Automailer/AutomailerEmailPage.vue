<script setup lang="ts">
import { handleHttpError } from '../../../lib/handleHttpError';
import axios from 'axios';
import { computed } from 'vue';
import { reactive } from 'vue';
import { onMounted } from 'vue';
import EmailEditor from '../../../components/EmailEditor.vue';
import Quill from 'quill';
import router from '@/router';
const d = reactive({
    automailerEmail: null as any,
    getting: false,
    saving: false,
    deleting: false,
    quillEditor: null as Quill,
});
const props = defineProps(["email"]);
// const emits = defineEmits(["deleted"])
const id = computed(() => router.currentRoute.value.params.id);

onMounted(() => {
    console.log("automailer email page");
    if(id.value === "new") {
        d.automailerEmail = {
            automailer: router.currentRoute.value.query.automailer,
            editorContent: {"ops":[{"insert":"Hello {{name}}\n\nBy now you should be familiar with the basics of how to make cool images with Dream Generator.  But did you know that Dream Generator also lets you chat with the smartest AI on the planet?\n\nIt's so hard to understand how AI can talk to you like a normal human. But it does!  It's so exciting to see how AI works and functions, and you can experience it all in the app.\n\nAI isn't for everyone.  It's a bit scary if your old, but don't be afraid. If we really forgive each other when we get mad, don't worry, the universe will forgive us.\n\nWhile it may be hard to say the right thing every time. We can be confident that the right thing is always the same.  Love.\n\nSo have fun making cool images with Dream Generator AI!\n"}]}
         };
    } else {
        getAutomailerEmail();
    }
    // d.automailerEmail = props.email;
})

async function getAutomailerEmail() {
    try {
        if (d.getting) return;
        d.getting = true;
        let response = await axios.get(`/api/get-automailer-email/${id.value}`);
        d.automailerEmail = response.data.item
        d.automailerEmail.editorContent = typeof d.automailerEmail.editorContent === "string" ? JSON.parse(d.automailerEmail.editorContent) : d.automailerEmail.editorContent;
    } catch (err) {
        handleHttpError(err, "Getting automailer email");
    } finally {
        d.getting = false;
    }
}

async function saveAutomailerEmail() {
    try {
        if (d.saving) return;
        d.saving = true;
        d.automailerEmail.html = d.quillEditor.getSemanticHTML();
        let response = await axios.post(`/api/post-automailer-email`, d.automailerEmail);
        for (let key in d.automailerEmail) {
            delete d.automailerEmail[key];
        }
        Object.assign(d.automailerEmail, response.data.automailer);
    } catch (err) {
        handleHttpError(err, "Automaile Email");
    } finally {
        d.saving = false;
    }
}

async function deleteAutomailerEmail() {
    if(!confirm("Are you sure you want to delete this email?")) return;
    try {
        if (d.deleting) return;
        d.deleting = true;
        await axios.delete(`/api/delete-automailer-email`, { params: { id: d.automailerEmail.id } });
        // emits("deleted")
        router.back();
    } catch (err) {
        handleHttpError(err, "");
    } finally {
        d.deleting = false;
    }
}

</script>
<template>
    <div class="admin-automailer-email-page">
        <v-card>
            <v-card-title>Email</v-card-title>
            <div class="card-body">
                <div v-if="d.automailerEmail">
                    <v-text-field v-model="d.automailerEmail.subject" label="Subject" />
                    <v-text-field type="number" label="Send At Days" :modelValue="(d.automailerEmail.sendAt || 0) / 1000 / 60 / 60 / 24" @update:modelValue="val => d.automailerEmail.sendAt = parseFloat(val) * 1000 * 60 * 60 * 24" />
                    <EmailEditor v-model="d.automailerEmail.editorContent" @editor="val => d.quillEditor = val" />
                    <div class="save-buttons">
                        <v-btn @click="saveAutomailerEmail">
                            <v-progress-circular v-if="d.saving" indeterminate />
                            <span v-else>Save</span>
                        </v-btn>
                        <v-btn @click="deleteAutomailerEmail" v-if="d.automailerEmail.id">
                            <v-progress-circular v-if="d.deleting" indeterminate />
                            <span v-else>Delete</span>
                        </v-btn>
                    </div>
                </div>
                <div v-else class="loading-container">
                    <!-- <v-progress-circular indeterminate></v-progress-circular> -->
                    <br>
                </div>
            </div>
        </v-card>
    </div>
</template>
<style lang="scss">
.admin-automailer-email-page {
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