<script lang="ts" setup>
import { reactive } from "vue";
import { serverMethods } from "../../serverMethods";
import MicrosoftGrantPermissionsButton from "./MicrosoftGrantPermissionsButton.vue";
import { showAlert, showConfirm, showModal } from '@/ui-elements/ShowModal/showModal';
import { ActiveDirectoryInfo } from "./result";
import { computed, onMounted } from "vue";
import { showHttpErrorIfExists } from "@/lib/handleHttpError";
import router from "@/router";

const d = reactive({
    name: "",
    currentUser: {
        email: "",
        permissions: []
    },
    organization: null,
    saving: false,
    loading: false,
    activeDirectoryInfo: null as ActiveDirectoryInfo | null,
    gettingActiveDirectoryInfo: false,

});



onMounted(async () => {
    if (router.currentRoute.value.params.id === "new") {
        d.organization = {
            id: null,
            name: "",
        };
    } else {
        d.loading = true;
        let result = await serverMethods.getOrganization(router.currentRoute.value.params.id);
        if (showHttpErrorIfExists(result))
            return;
        d.organization = result;
    }
})


async function addUserToOrganization() {
    let response = await serverMethods.postAddUserToOrganization({ user: d.currentUser, organization: d.organization.id });
}

let requestedScopes = ['GroupMember.Read.All', 'openid', 'profile', 'User.Read', 'User.Read.All', 'email', "offline_access"];
async function getActiveDirectory(data) {
    if (d.gettingActiveDirectoryInfo)
        return;
    console.log("active", data);
    let { scopes } = data;
    let scopesWithoutOfflineAccess = scopes.filter(scope => scope !== "offline_access");
    // make sure the user has the correct permissions
    if (scopesWithoutOfflineAccess.some(scope => !scopes.includes(scope))) {
        console.error("User does not have the correct permissions");
        showAlert("You must grant permissions to use this feature (make sure to check the box). Do not worry, this is read-only.");
        return;
    }
    localStorage.setItem("microsoft", JSON.stringify(data));
    d.gettingActiveDirectoryInfo = true;
    let response = await serverMethods.postMicrosoftGrant(data) as any;
    if (showHttpErrorIfExists(response))
        return;
    d.gettingActiveDirectoryInfo = false;
    d.activeDirectoryInfo = response;
    console.log("response", response);
}

const usersWithGroups = computed(() => {
    if (!d.activeDirectoryInfo)
        return [];
    let users = d.activeDirectoryInfo.users.map(user => {
        let groups = d.activeDirectoryInfo.groupMembers.filter(groupMemberData => groupMemberData.users.find(u => u.id === user.id)).map(groupMemberData => groupMemberData.group);
        return { user, groups };
    });
    return users;
});

const newUsersCount = computed(() => usersWithGroups.value.filter(({ user }) => user.selected).length);
const allSelected = computed(() => usersWithGroups.value.every(({ user }) => user.selected));
const someSelected = computed(() => usersWithGroups.value.some(({ user }) => user.selected) && !allSelected.value);

function toggleSelectAllUsers() {
    let allSelectedValue = allSelected.value;
    usersWithGroups.value.forEach(({ user }) => user.selected = !allSelectedValue);
}

async function saveOrganization() {
    if (!d.organization.name || d.organization.name.trim().length < 2) {
        showAlert("Please enter an organization name at least 2 characters long.");
        return;
    }
    if (!d.organization.id) {
        d.saving = true;
        let response = await serverMethods.postCreateOrganization({ organization: d.organization, microsoftUsers: usersWithGroups.value.filter(({ user }) => user.selected) }) as any;
        console.log("response", response);
        d.saving = false;
        if (showHttpErrorIfExists(response))
            return;
        if (router.currentRoute.value.params.id === "new") {
            router.push({ path: `/organization/${response.organization.id}` });
        }
    }
}
</script>
<template>
    <div class="create-organization-page">
        <v-text-field label="Organization Name" v-model="d.organization.name" hide-details="auto" />
        <v-alert color="info" style="flex-shrink:1;flex-grow: 0; margin: 10px;" text="Users are only billed if they log in or use the product during the month, so you can add as many as you want."></v-alert>
        <div v-if="d.gettingActiveDirectoryInfo" class="fetching-ad">
            <div>Fetching Active Directory Users and Groups</div>
            <div style="height:20px;"></div>
            <v-progress-circular indeterminate></v-progress-circular>
        </div>
        <div v-else-if="d.activeDirectoryInfo" class="users-list table">
            <div class="user-record table-row">
                <v-checkbox class="select-user-checkbox" hide-details="auto" density="compact" @click="toggleSelectAllUsers()" :modelValue="allSelected" :indeterminate="someSelected" />
                <div class="user-name">Select Users</div>
            </div>
            <div v-for="{ user, groups } of usersWithGroups" class="user-record table-row">
                <v-checkbox class="select-user-checkbox" v-model="user.selected" hide-details="auto" density="compact" />
                <div class="user-name">{{ user.displayName }}</div>
                <div class="user-email">{{ user.mail }}</div>
                <div class="user-groups">
                    <div v-for="group of groups">{{ group.displayName }}</div>
                </div>
            </div>
            <div style="display: flex; padding: 10px; justify-content: center;">
                <v-btn color="primary" @click="saveOrganization()">Create Organization With {{ newUsersCount }} Users</v-btn>
            </div>
        </div>
        <div v-if="!d.activeDirectoryInfo && !d.gettingActiveDirectoryInfo" style="padding: 10px">
            <MicrosoftGrantPermissionsButton @login="getActiveDirectory" :scopes="requestedScopes" />
        </div>
        <!-- <div class="add-user">
            <div style="line-height: 1; font-size: 18px; font-weight: bold; padding: 10px 0;">Add User</div>
            <div style="display: flex; flex-direction: column;">
                <v-text-field label="Email" v-model="d.currentUser.email" hide-details="auto" />
                <v-select :multiple="true" label="Permissions" :items="[{ key: 'use', value: 'Usage' }, { key: 'audit', value: 'Audit' }, { key: 'manage_users', value: 'Manage Users' }]" v-model="d.currentUser.permissions" item-title="value" item-value="key" hide-details="auto" />
            </div>
            <div style="height: 10px;"></div>
            <v-btn color="primary" @click="addUserToOrganization()">Submit</v-btn>
        </div> -->
    </div>
</template>
<style lang="scss">
.create-organization-page {
    .v-alert {
        overflow: initial;
    }
    .user-record {
        padding: 10px;
        display: flex;
        align-items: center;
        .select-user-checkbox {
            margin-right: 7px;
        }
        .user-email {
            margin-right: 10px;
        }
        .user-name {
            margin-right: 10px;
            font-weight: bold;
            font-size: 18px;
        }
    }
    .user-groups {
        font-size: 16px;
        display: flex;
        >div {
            margin-right: 5px;
            background: gainsboro;
            line-height: 1;
            padding: 4px;
        }
    }
    .table {
        .table-row {
            // alternate 
            &:nth-child(odd) {
                background: rgb(240, 240, 240);
            }
        }
    }
    .fetching-ad {
        display: flex;
        flex-direction: column;
        padding: 50px;
        align-items: center;
        justify-content: center;
    }
    justify-content: flex-start;
    >* {
        flex-grow: 0;
    }
    .add-user {
        width: 100%;
        max-width: 400px;
        padding: 5px;
        background: rgb(225, 202, 157);
    }
}
</style>