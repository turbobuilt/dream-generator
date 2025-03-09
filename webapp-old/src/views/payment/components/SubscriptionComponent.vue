<script lang="ts">
import { Options, Vue } from "vue-class-component";
import type Payment from "../Payment.vue";
import axios from "axios"
import { store } from "@/store";
import PurchaseReasonVue from "@/components/PurchaseReason.vue";
import { loadStripe } from "@stripe/stripe-js";

@Options({
    components: { PurchaseReasonVue }
})
export default class SubscriptionComponent extends Vue {
    declare $parent: Payment;
    store = store;
    elements = null;
    paymentElement

    async getClientSecret(stripeId) {
        try {
            if (this.$parent.initalizing)
                return;
            this.$parent.error = "";
            try {
                if (this.elements) {
                    this.elements.destroy();
                    this.elements = null;
                }
                if (this.paymentElement) {
                    this.paymentElement.destroy();
                    this.paymentElement = null;
                }
            }
            catch (error) {
                console.error("error clearing old payment info", error);
            }
            let response = await axios.post("/api/create-payment-intent", {
                stripeToken: stripeId
            });
            let { clientSecret } = response.data;
            const appearance = { /* appearance */ };
            const options = { /* options */ };
            let stripe = await this.$parent.stripePromise;
            const elements = stripe.elements({ clientSecret, appearance });
            this.elements = elements;
            this.paymentElement = elements.create('payment', options);
            this.paymentElement.mount('#payment-element');
            this.paymentElement.on("change", (event) => {
                if (event.complete) {
                    this.$parent.showCheckoutButton = true;
                }
                else {
                    this.$parent.showCheckoutButton = false;
                }
            });
            this.$parent.paymentInitialized = true;
        }
        catch (error) {
            this.$parent.error = error.message;
            console.error(error);
        }
        finally {
            this.$parent.initalizing = false;
        }
    }
}
</script>
<template>
    <div class="subscription-component">
        <div class="plans">
            <div class="plan" v-for="plan in $parent.plans.slice(0, 1)">
                <div class="plan-title">{{ plan.name }}</div>
                <div class="reasons">
                    <PurchaseReasonVue :reason="plan.description" />
                    <PurchaseReasonVue reason="Support Development" />
                    <PurchaseReasonVue reason="You Are Awesome" />
                </div>
                <div class="plan-amount">{{ $parent.formatMoney(plan.price) }} per month</div>
                <v-btn color="primary" @click="getClientSecret(store.isTest ? plan.testStripeId : plan.stripeId)" :disabled="!$parent.stripeLoaded">Support Monthly</v-btn>
            </div>
            <div v-if="$parent.showAllPlans">
                <div v-for="plan in $parent.plans" class="plan">
                    <div class="plan-title">{{ plan.name }}</div>
                    <div class="reasons">
                        <PurchaseReasonVue :reason="plan.description" />
                        <PurchaseReasonVue reason="Support Development" />
                        <PurchaseReasonVue reason="You Are Awesome" />
                    </div>
                    <div class="plan-amount">{{ $parent.formatMoney(plan.price) }}</div>
                    <v-btn color="primary" @click="getClientSecret(store.isTest ? plan.testStripeId : plan.stripeId)" :disabled="!$parent.stripeLoaded">Support Monthly</v-btn>
                </div>
                <div>1 Credit gets 1 high quality image or 5 low quality ones. Enjoy!</div>
            </div>
            <br>
        </div>
    </div>
</template>
<style lang="scss">
.subscription-component {}
</style>