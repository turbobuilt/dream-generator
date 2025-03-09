<script lang="ts" setup>
import { reactive } from 'vue';
import { mdiCheck, mdiClose } from "@mdi/js";
import { serverMethods } from '@/serverMethods';
import { showHttpErrorIfExists } from '@/lib/handleHttpError';
import { store } from '@/store';


const d = reactive({
    userName: "",
    checkingUserName: true,
    userNameValid: false,
    saving: false
})
const props = defineProps(["onClose"])
let userNameCheckTimeout = null;

async function userNameTextChanged(val) {
    d.userName = val;
    if (userNameCheckTimeout) {
        return;
    }
    userNameCheckTimeout = setTimeout(checkUserName, 500);
}

async function checkUserName() {
    clearTimeout(userNameCheckTimeout);
    userNameCheckTimeout = null;
    if (!d.userName) {
        return;
    }
    d.checkingUserName = true;
    let result = await serverMethods.checkUserName({ userName: d.userName })
    d.checkingUserName = false;
    if (showHttpErrorIfExists(result))
        return;
    d.userNameValid = result.available;
}

async function saveUserName() {
    d.saving = true;
    let result = await serverMethods.saveUserName({ userName: d.userName })
    d.saving = false;
    if (showHttpErrorIfExists(result))
        return;
    store.authenticatedUser.userName = d.userName;
    props.onClose({ userName: d.userName });
}
</script>
<template>
    <div class="pick-user-name-modal">
        <h2>Pick a user name!</h2>
        <div class="input-container">
            <v-text-field label="Username" :modelValue="d.userName" @update:modelValue="userNameTextChanged" hide-details="auto" variant="underlined" :autofocus="true" />
            <div v-if="d.userName" style="margin-left: 5px;">
                <v-progress-circular v-if="d.checkingUserName" indeterminate :size="20" color="primary" />
                <v-icon v-else-if="d.userNameValid" :icon="mdiCheck" color="green" />
                <v-icon v-else-if="!d.userNameValid" :icon="mdiClose" color="red" />
            </div>
        </div>
        <btn :disabled="d.checkingUserName || !d.userNameValid" @click="saveUserName" style="margin-top: 10px">
            <div v-if="d.saving">Saving...</div>
            <div v-else>Save Username</div>
        </btn>
    </div>
</template>
<style lang="scss">
.pick-user-name-modal {
    background: white;
    padding: 14px;
    border-radius: 15px;
    h2 {
        margin: 0;
        text-align: center;
        font-weight: normal;
        margin-bottom: 10px;
    }
    .input-container {
        display: flex;
        align-items: flex-end;
    }
}
</style>