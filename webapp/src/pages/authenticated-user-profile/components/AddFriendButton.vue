<script lang="ts" setup>
import { showHttpErrorIfExists } from '@/lib/handleHttpError';
import { serverMethods } from '@/serverMethods';
import { mdiCheck } from '@mdi/js';
import { reactive } from 'vue';

const props = defineProps(["profile"])

async function addFriend() {
    props.profile.isFriend = true;
    let result = await serverMethods.postAddFriend({ friendId: props.profile.userId });
    if (showHttpErrorIfExists(result)) {
        props.profile.isFriend = false;
        return;
    }
}
</script>
<template>
    <div class="simple-button" v-if="!props.profile.isFriend" v-touchable @click="addFriend">
        Add Friend
    </div>
    <div v-else class="friend-check">
        <v-icon :icon="mdiCheck" color="primary" />
    </div>
</template>
<style lang="scss">
@import '@/scss/variables.scss';
.friend-check {
    color: $primary;
    font-size: 24px;
    margin-left: 10px;
    display: inline-flex;
}
</style>