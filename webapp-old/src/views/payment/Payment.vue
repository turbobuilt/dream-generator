<script lang="ts">
import PurchaseReasonVue from '@/components/PurchaseReason.vue';
import { handleHttpError } from '@/lib/handleHttpError';
import { store } from '@/store';
import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';
var stripe;
import CreditPackComponent from './components/CreditPackComponent.vue';
import { formatMoney } from '@/lib/helpers';
import { Vue, Options } from "vue-class-component";
import SubscriptionComponent from './components/SubscriptionComponent.vue';
import type { App } from 'vue';


@Options({
    computed: {
        currentPlan() {
            if (!this.currentSubscriptionInfo || !this.currentSubscriptionInfo.plan)
                return null;
            return this.plans.find(p => p.id == this.currentSubscriptionInfo.plan);
        }
    },
    watch: {
        "store.authenticatedUser": {
            handler(val) {
                console.log("val ", val)
                this.start();
            },
            immediate: true
        }
    },
    created() {
        console.log("LFKDJLKSFJLKJ");
    },
    components: { PurchaseReasonVue, CreditPackComponent, SubscriptionComponent }
})
export default class Payment extends Vue {
    // declare readonly $root: App;
    store;
    plans = [];
    showAllPlans = false;
    initalizing = false;
    error = "";
    paymentInitialized = false;
    checkingOut = false;
    paymentElement = null;
    elements = null;
    verifyingPayment = false;
    gettingCurrentSubscriptionInfo = false;
    currentSubscriptionInfo = null;
    confirmingCancel = false;
    cancellingSubscription = false;
    showSuccessBanner = false;
    showCheckoutButton = false;
    currentPlan = null;
    purchasingCreditPack = false;
    purchasingSubscription = false;
    stripeLoaded = false;

    get supportButtonText() {
        if (!this.stripeLoaded) {
            return "Loading...";
        }
        else if (store.wantsToBePatron) {
            return "Support";
        }
        else {
            return "Purchase";
        }
    }

    async start() {
        console.log("starting");
        this.getPlans();
        let intent = window.location.href.match(/payment_intent=([^&]+)/);
        if (intent) {
            let paymentIntent = intent[1];
            try {
                let response = await axios.post("/api/verify-stripe-payment", {
                    paymentIntent,
                    isTest: store.isTest,
                    creditPack: window.location.href.match(/creditPack=([^&]+)/)?.[1] ? true : false
                });
                let { creditsRemaining, error, plan } = response.data;
                if (error) {
                    this.error = error;
                    return;
                }
                console.log("credits remaining", creditsRemaining);
                store.authenticatedUser.creditsRemaining = parseFloat(creditsRemaining);
                console.log("store.authenticatedUser.creditsRemaining", store.authenticatedUser.creditsRemaining);
                store.authenticatedUser.plan = plan;
                this.showSuccessBanner = true;
                this.$router.replace(this.$route.path.split("?")[0]);
                return;
            }
            catch (error) {
                console.error(error);
                this.error = "error processing payment.  Please do not try again, instead contact support@dreamgenerator.ai for help because it probably went through. " + (error?.response?.data?.error || error?.response?.data || error?.message || error);
                return;
            }
        }
        await this.getCurrentSubscriptionInfo();
    }
    async verifyPayment() {

    }
    async getPlans() {
        try {
            console.log("getting plans")
            let response = await axios.get(`/api/get-plans`);
            this.plans = response.data.items;
        } catch (err) {
            handleHttpError(err, "getting plans");
        } finally {

        }
    }
    async getCurrentSubscriptionInfo() {
        console.log("Getting current subscirption ifno");
        try {
            console.log("got")
            this.gettingCurrentSubscriptionInfo = true;
            let response = await axios.get(`/api/stripe-status`, {
                params: {
                    isTest: store.isTest
                }
            });
            this.currentSubscriptionInfo = response.data;
        }
        catch (error) {
            console.error(error);
            this.error = error;
        }
        finally {
            this.gettingCurrentSubscriptionInfo = false;
        }
    }
    init(stripe) {

    }
    formatMoney = formatMoney;
    async cancelSubscription() {
        try {
            if (this.cancellingSubscription)
                return;
            this.cancellingSubscription = true;
            this.error = "";
            let response = await axios.get("/api/cancel-stripe-subscription", {
                params: {
                    isTest: store.isTest
                }
            });
            if (response.data.error) {
                this.error = response.data.error;
                return;
            }
            this.confirmingCancel = false;
            await this.getCurrentSubscriptionInfo();
        }
        catch (err) {
            console.error(err);
            this.error = err.message;
        }
        finally {
            this.cancellingSubscription = false;
        }
    }
    async checkout() {
        try {
            if (this.checkingOut)
                return;
            this.checkingOut = true;
            this.error = "";
            let stripe = await this.stripePromise;
            let { error } = await stripe.confirmPayment({
                elements: this.elements,
                confirmParams: {
                    return_url: window.location.origin + "/app/create?stripe-redirect=true"
                },
            });
            if (error) {
                this.error = error.message;
            }
        }
        catch (error) {
            this.error = error.message;
            console.error(error);
        }
        finally {
            this.checkingOut = false;
        }
    }
}
</script>
<template>
    <div class="payment-page">
        <div class="error">{{ error }}</div>
        <div v-if="gettingCurrentSubscriptionInfo" class="loading-notice">
            Loading Payment Info
        </div>
        <div v-else class="payment-page-inner">
            <div v-if="initalizing" class="initializing">
                Initializing...
            </div>
            <div v-if="showSuccessBanner" class="success-messages">
                <div>Congratulations!</div>
                <div>Welcome to our community.</div>
                <div>Your generous support will help ensure we can continue to update the product. With your help, we can do anything.</div>
                <div>The world needs people to apply AI technology to every facet of life. By subscribing (or buying credits to) to this fun product, you are actually funding our research into advanced AI that will change the world. It is our goal to make sure nobody goes hungry, and with AI we think we can get there. So your support is very meaningful.</div>
                <div>If you have any questions, please reach out to me at support@dreamgenerator.ai.</div>
                <div>Sincerely,</div>
                <div>Hans</div>
            </div>
            <div v-else-if="currentPlan" class="current-info-display">
                <div class="plan">
                    <div class="plan-title">{{ currentPlan.name }}</div>
                    <div class="cancellation-title" v-if="currentSubscriptionInfo.cancellationPending">Ending Soon</div>
                    <div class="plan-description">{{ currentPlan.price }} images per month!</div>
                    <div class="plan-amount">{{ formatMoney(currentPlan.price) }}</div>
                    <div>You are signed up!</div>
                    <br>
                </div>
                <br>
                <div v-if="!currentSubscriptionInfo.cancellationPending">
                    <button class="cancel" v-if="!confirmingCancel" @click="confirmingCancel = true">Cancel</button>
                    <button class="cancel" v-if="confirmingCancel" @click="cancelSubscription">{{ cancellingSubscription ? "Cancelling..." : "Click to Confirm" }}</button>
                </div>
                <div v-else>
                    <div>Your plan will be cancelled at the end of the month and you won't be charged again.</div>
                </div>
            </div>
            <div v-else-if="!initalizing && !paymentInitialized" class="options">
                <SubscriptionComponent v-if="!purchasingCreditPack" />
                <CreditPackComponent />
            </div>
            <div v-show="paymentInitialized" class="payment-container">
                <div id="payment-element"></div>
                <br>
                <button class="primary checkout-button" @click="checkout" v-if="showCheckoutButton">{{ !checkingOut ? "Checkout" : "Working..." }}</button>
            </div>
        </div>
        <div class="space"></div>
        <div class="advanced-settings-container">
            <v-btn class="advanced-settings" :to="`/advanced-settings`">Advanced Settings</v-btn>
        </div>
    </div>
</template>
<style lang="scss">
.payment-page {
    flex-grow: 1;
    padding: 20px;
    .initializing {
        text-align: center;
    }
    .success-messages {
        display: flex;
        flex-direction: column;
        align-items: center;
        div {
            margin-bottom: 5px;
        }
    }
    .payment-page-inner {
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    .cancellation-title {
        background: #c9c9c9;
    }
    display: flex;
    justify-content: center;
    flex-direction: column;
    .payments-container {
        width: 100%;
        max-width: 500px;
    }
    .plans {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
    }
    .space {
        flex-grow: 1;
    }
    .advanced-settings-container {
        margin-top: 20px;
        display: flex;
        justify-content: center;
    }
    .loading-notice {
        text-align: center;
    }
    .reasons {
        padding: 10px;
    }
    .plan {
        background: whitesmoke;
        width: 100%;
        max-width: 250px;
        // padding: 10px;
        margin: 10px;
        display: flex;
        flex-direction: column;
        // align-items: center;
        text-align: center;
        box-shadow: 0 0 4px silver;
        border-radius: 3px;
        .plan-title {
            font-size: 20px;
            background: rgb(33, 150, 243);
            color: white;
            border-bottom: 1px solid silver;
        }
        .plan-description {
            margin-top: 18px;
            font-size: 16px;
        }
        .plan-amount {
            font-size: 18px;
            margin-top: 10px;
        }
        button {
            margin: 10px;
            font-size: 18px;
            font-weight: bold;
            background: rgb(33, 150, 243);
            box-shadow: 0 0 3px rgba(0, 0, 0, .7);
            color: white;
            transition: .1s all;
            &:hover {
                background: rgb(25, 112, 184);
            }
        }
    }
    .error {
        text-align: center;
        color: red;
        padding: 10px;
    }
    .current-info-display {
        display: flex;
        flex-direction: column;
        align-items: center;
    }
}
</style>