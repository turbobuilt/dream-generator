<script lang="ts" setup>
import router from "@/router";
</script>
<template>
    <div class="manage-enterprise-page">
        <h2>Welcome to Enterprise!</h2>
        <div>Dream Generator has special features for businesses of all sizes.</div>
        <div class="reason">
            <div>
                <div class="numeral">1</div>
                <div>Everything is Tracked</div>
            </div>
            <div>To ensure compliance and employee quality, all chats, images, etc. are logged for review by admin to ensure resources are used correctly.</div>
        </div>
        <div class="reason">
            <div>
                <div class="numeral">2</div>
                <div>Single Sign On</div>
            </div>
            <div>You can add anybody via their Microsoft, Google, or Apple account to your organization.</div>
        </div>
        <div class="reason">
            <div>
                <div class="numeral">2</div>
                <div>Ultimate Quality</div>
            </div>
            <div>We use APIs from multiple providers, allowing greater diversity than if you were to simply create an enterprise account at OpenAI.</div>
        </div>
        <v-button @click="router.push('/enterprise')">Upgrade Now!</v-button>
    </div>
</template>
<style lang="scss">
.manage-enterprise-page {}
</style>