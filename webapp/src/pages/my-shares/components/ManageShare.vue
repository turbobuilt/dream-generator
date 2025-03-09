<script lang="ts" setup>
import { showHttpErrorIfExists } from '@/lib/handleHttpError';
import { serverMethods } from '@/serverMethods';
import { reactive } from 'vue';

let props = defineProps<{
    share: {
        id: number;
    }
}>();

const d = reactive({
    unpublishing: false,
    error: ""
});
const emit = defineEmits(["deleted"]);

async function unPublish() {
    d.unpublishing = true;
    let result = await serverMethods.deleteShare({ id: props.share.id }) as any;
    d.unpublishing = false;
    if (await showHttpErrorIfExists(result))
        return;
    emit("deleted");
}
</script>
<template>
    <div class="manage-share">
        <btn @click="unPublish">
            <div v-if="!d.unpublishing">Unpublish</div>
            <div v-else>Working...</div>
        </btn>
    </div>
</template>
<style lang="scss">
.manage-share {
    padding: 10px;
}
</style>