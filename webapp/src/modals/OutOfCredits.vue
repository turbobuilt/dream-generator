<script lang="ts" setup>
import Features from '@/pages/payment/Features.vue';
import Checkout from '@/sections/checkout/Checkout.vue';
import { store } from '@/store';

</script>
<template>
    <bottom-sheet v-model="store.showingUpgradeModal" maxHeight="95vh">
        <div class="out-of-credits-modal">
            <h2>Time to Upgrade!</h2>
            <p class="explain">You have to upgrade on the web version, but you can do ad supported on the iOS or Android apps. However, the apps are limited in content filtering because of store policies.</p>
            <p class="explain">If you would like to advertise to support the web. Please email support@dreamgenerator.ai and we will get set up!</p>
            <Features />
            <Checkout />
        </div>
    </bottom-sheet>
</template>
<style lang="scss">
.out-of-credits-modal {
    h2 {
        margin: 0;
        margin-bottom: 10px;
        font-size: 18px;
    }
    p.explain {
        margin-bottom: 10px;
        line-height: 1.1;
        font-size: 14px;
    }
    padding: 15px;
    .checkout-component {
        padding-top: 0;
    }
}
</style>