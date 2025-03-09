<script lang="ts" setup>
import router from '@/router';
import { store, logout, nav, currentPlan } from '@/store';
import PaymentModal from '../payment/PaymentModal.vue';
import { reactive } from 'vue';
import { serverMethods } from '@/serverMethods';
import { showHttpErrorIfExists } from '@/lib/handleHttpError';
import { deleteImageDb } from '@/lib/imageSave';
import { showAlert, showConfirm } from '@/ui-elements/ShowModal/showModal';
import Checkout from '@/sections/checkout/Checkout.vue';
import Features from '../payment/Features.vue';
import TermsPage from '../terms/TermsPage.vue';
import PrivacyPage from '../privacy/PrivacyPage.vue';
import { computed } from 'vue';
import { mdiCheck } from '@mdi/js';
import { onMounted } from 'vue';
import { getLoggedInUser } from '@/lib/auth';

const d = reactive({
    deletingAccount: false,
    changingPlan: false,
    cancellingPlan: false
})

onMounted(async () => {
    getLoggedInUser();
})

async function deleteAccount() {
    let confirmed = await showConfirm({ title: "Are you sure you want to delete your account?", content: "All your images will be deleted as well. Please download any you want before continuing. We may change this in the future so you can keep them locally if you want, but for now, it all goes!" });
    if (!confirmed) return;
    d.deletingAccount = true;
    let result = await serverMethods.getDeleteAccount();
    d.deletingAccount = false;
    if (await showHttpErrorIfExists(result)) return;
    deleteImageDb();
    logout();
    router.replace("/")
    console.log("did logout");
}

function startChangePlan() {
    d.changingPlan = true;
}

async function showConfirmCancel() {
        if (d.cancellingPlan)
            return;
    if (await showConfirm({ title: "Are you sure you want to cancel your plan?", content: "At the end of the month, your plan won't renew." })) {
        d.cancellingPlan = true;
        let result = await serverMethods.cancelStripeSubscription();
        d.cancellingPlan = false;
        if (await showHttpErrorIfExists(result)) {
            return;
        }
        getLoggedInUser();
        showAlert({ title: "Plan Scheduled for Cancellation", content: `
        <p>If you run into any issues, email support@dreamgenerator.ai.</p>
        <p>Your payment methods have been deleted so if you want to resubscribe, you'll need to start over.</p>
        <p>Right now, resubscribing may not work, but if you need help with that let us know. There are so many ways billing can go wrong, we just decided to delete your billing info as soon as you cancel. So no accidents will happen! God bless you, have a great day!</p>` });
    }
}
</script>
<template>
    <div class="account-page" v-if="store.authenticatedUser && store.plans">
        <div class="content">
            <Features v-if="!store.authenticatedUser.plan" />
            <Checkout v-if="true || !store.authenticatedUser.plan" />
            <btn v-if="store.authenticatedUser.downgradePlanTo !== 'cancel'" class="cancel-plan" @click="showConfirmCancel()">Cancel Plan</btn>
        </div>
        <div class="legal-links">
            <router-link to="/terms">Terms</router-link>
            <router-link to="/privacy">Privacy</router-link>
        </div>
        <div>
            <btn variant="outlined" class="text-only" @click="logout()">Logout</btn>
        </div>
        <div style="height: 10px;"></div>
        <div>
            <btn variant="outlined" class="text-only" @click="deleteAccount()">Delete Account</btn>
        </div>
        <!-- <div>
            <btn :to="">Account</btn>
        </div> -->
    </div>
</template>
<style lang="scss">
.account-page {
    display: flex;
    flex-direction: column;
    padding: 10px;
    overflow-y: auto;
    h4 {
        margin-top: 10px;
    }
    .subscribed-notice {
        display: flex;
        align-items: center;
        border: 2px solid rgb(196, 111, 50);
        // background: rgb(205, 255, 205);
        border-radius: 10px;
        padding: 10px;
        i {
            margin-right: 10px;
            border-radius: 1000px;
            border: 1px solid rgb(76, 175, 80); // rgb(68, 119, 68);
        }
    }
    .content {
        flex-grow: 1;
    }
    .legal-links {
        display: flex;
        justify-content: space-around;
        padding: 20px 10px;
        background: white;
        a, a:visited {
            text-decoration: none;
            font-size: 14px;
            color: gray;
        }
    }
}
</style>