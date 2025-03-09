<script lang="ts">
import axios from "axios";
import { store } from "../../../store";
import { formatMoney } from "@/lib/helpers";
import { Vue, Options } from "vue-class-component";
import Payment from "../Payment.vue";
import PurchaseReasonVue from "@/components/PurchaseReason.vue";
import { handleHttpError } from "@/lib/handleHttpError";

@Options({
    props: ["creditPack"],
    components: { PurchaseReasonVue },
    async mounted() {
        await this.getCreditPacks();
        this.createPaymentIntent();
    }
})
export default class CreditPackComponent extends Vue {
    declare $parent: Payment;
    creditPacks = null as { [key: string]: { price: number, credits: number, stripeId: string, testStripeId: string, name: string, description: string } } | null;
    error = "";
    store = store
    paymentIntentInfo = null;
    elements = null;
    paymentElement = null;
    showCheckoutButton = false;
    loadingPaymentForm = true;

    async getCreditPacks() {
        try {
            let response = await axios.get("/api/get-credit-packs-list");
            this.creditPacks = response.data.creditPacks;
        } catch (error) {
            console.error(error);
            this.error = error.message;
        }
    }
    formatMoney = formatMoney
    async startCreditPackPurchase(stripeId: string) {
        try {
            this.$parent.purchasingCreditPack = true;
            let stripe = await this.$parent.stripePromise;
            let { clientSecret } = this.paymentIntentInfo;
            const appearance = { /* appearance */ };
            const options = { /* options */ };
            const elements = stripe.elements({ clientSecret, appearance });
            this.elements = elements;
            this.paymentElement = elements.create('payment', options);
            this.paymentElement.mount('#credit-pack-payment-element');
            this.paymentElement.on("change", (event) => {
                if (event.complete) {
                    this.showCheckoutButton = true;
                }
                else {
                    this.showCheckoutButton = false;
                }
            });
            // set loading false when ready
            this.paymentElement.on("ready", () => {
                console.log("READY")
                this.loadingPaymentForm = false;
            });
        } catch (err) {
            console.error(err);
            this.$parent.purchasingCreditPack = false;
        }
    }
    async createPaymentIntent() {
        try {
            let response = await axios.get(`/api/get-credit-pack-payment-intent`, { params: { creditPackId: Object.keys(this.creditPacks)[0], isTest: store.isTest } });
            this.paymentIntentInfo = response.data;
        } catch (err) {
            handleHttpError(err, "setting up payments");
        } finally {

        }
    }
    checkingOut = false;
    async confirmCreditPackPurchase() {
        try {
            if (this.checkingOut)
                return;
            this.checkingOut = true;
            this.error = "";
            let stripe = await this.$parent.stripePromise;
            let { error } = await stripe.confirmPayment({
                elements: this.elements,
                confirmParams: {
                    return_url: window.location.origin + "/app/create?stripe-redirect=true&creditPack=true"
                },
            });
            if (error) {
                this.error = error.message;
            }
        } catch (err) {
            handleHttpError(err, "confirming payment");
        } finally {
            this.checkingOut = false;
        }
    }
}
</script>
<template>
    <div class="credit-pack-component">
        <div v-if="creditPacks && !$parent.purchasingCreditPack">
            <div v-for="(creditPack, id) in creditPacks" class="plan">
                <div class="plan-title">{{ creditPack.name }}</div>
                <div class="reasons">
                    <PurchaseReasonVue :reason="creditPack.description" />
                    <PurchaseReasonVue reason="Support Development" />
                    <PurchaseReasonVue reason="You Are Awesome" />
                </div>
                <div class="plan-amount">{{ formatMoney(creditPack.price) }}</div>
                <v-btn color="primary" @click="startCreditPackPurchase(store.isTest ? creditPack.testStripeId : creditPack.stripeId)" :disabled="!$parent.stripeLoaded">Support Once</v-btn>
            </div>
        </div>
        <div v-else-if="$parent.purchasingCreditPack">
            <div id="credit-pack-payment-element"></div>
            <div v-if="loadingPaymentForm">Loading...</div>
            <br>
            <v-btn color="primary" @click="confirmCreditPackPurchase" v-if="!loadingPaymentForm">
                <v-progress-circular v-if="checkingOut" indeterminate color="white"></v-progress-circular>
                <span v-else>Confirm Purchase</span>
                </v-btn>
            <div v-if="error">{{ error }}</div>
        </div>
    </div>
</template>
<style lang="scss">
.credit-pack-component {
    .error {
        color: red;
        padding: 10px;
    }
}
</style>