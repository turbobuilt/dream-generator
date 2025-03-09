<script lang="ts" setup>
let emit = defineEmits(["close"]);

async function selectReason(reason: string) {
    emit("close", reason);
}
</script>
<template>
    <div class="select-report-post-reason-modal">
        <h2>Why are you reporting this post?</h2>
        <btn @click="selectReason('gratuitous violence')">Gratuitous Violence</btn>
        <btn @click="selectReason('gratuitous sexual content')">Gratuitous Sexual Content</btn>
        <btn @click="selectReason('horrifyingly ugly')">Horrifyingly Ugly</btn>
    </div>
</template>
<style lang="scss">
@import "@/scss/variables.scss";
.select-report-post-reason-modal {
    background: white;
    border-radius: $modalBorderRadius;
    padding: $modalPadding;
    h2 {
        font-weight: normal;
        margin-bottom: 15px;
        font-size: 18px;
        text-align: center;
    }
    .v-btn {
        margin-bottom: 10px;
    }
}
</style>