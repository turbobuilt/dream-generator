<script lang="ts">
import Vue, { defineComponent } from 'vue';
import axios from "axios";
import { loadStripe } from '@stripe/stripe-js';
import { store } from "../../store"
import { computed } from 'vue';
import { serverMethods } from '@/serverMethods';
import { showHttpErrorIfExists } from '@/lib/handleHttpError';
import { openStripePortal } from '@/lib/stripe';
import { showAlert } from '@/ui-elements/ShowModal/showModal';

// alipay.svg      code.svg        elo.svg         hipercard.svg   mastercard.svg  unionpay.svg
// amex.svg        diners.svg      generic.svg     jcb.svg         mir.svg         visa.svg
// code-front.svg  discover.svg    hiper.svg       maestro.svg     paypal.svg
let paymentMethods = [
    "alipay",
    "amex",
    "code",
    "code-front",
    "diners",
    "discover",
    "elo",
    "generic",
    "hipercard",
    "jcb",
    "maestro",
    "mastercard",
    "mir",
    "paypal",
    "unionpay",
    "visa"
];

// async function loadPaymentMethodIcons() {
//     let promises = [];
//     for (let method of paymentMethods) {
//         promises.push(new Promise((resolve, reject) => {
//             let img = new Image();
//             img.onload = () => {
//                 resolve({ method, img });
//             }
//             img.onerror = () => {
//                 reject({ method, img });
//             }
//             img.src = "/payment-method-icons/" + method + ".svg";
//         }));
//     }
// }

export default defineComponent({
    props: ["plan"],
    data() {
        return {
            store,
            search: "",
            stripe: null,
            showCheckoutButton: false,
            checkingOut: false,
            paymentInitialized: false,
            prorationAmount: null,
            paymentMethods: null,
            paymentMethodIcons: {},
            willDowngrade: false,
            error: "",
        }
    },
    async mounted() {
        if (window.location.href.includes("localhost"))
            return;
        console.log(this.$route);
        console.log(this.plan, "Plan");
        this.stripe = await loadStripe(store.stripePublicToken);
        if (this.$parent.initalizing)
            return;
        // if (store.authenticatedUser.plan) {
        //     // change plan
        //     this.getChangePlanInvoicePreview();
        //     return;
        // }

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
        } catch (error) {
            console.error("error clearing old payment info", error);
        }
        let result = await serverMethods.createPaymentIntent({ stripeToken: this.plan.stripeId, redirectUrl: window.location.href });
        if (await showHttpErrorIfExists(result)) {
            this.$emit("close");
            return;
        }
        // let response = await axios.post("/api/create-payment-intent", {
        //     stripeToken: this.plan.stripeId
        //     // planId: this.plan.id
        // });
        let { clientSecret, willDowngrade } = result;
        if (willDowngrade) {
            this.willDowngrade = true;
            console.log("will downgrade");
            return;
        }
        const appearance = { /* appearance */ };
        const options = { /* options */ };
        let stripe = this.stripe;
        const elements = stripe.elements({ clientSecret, appearance });
        this.elements = elements;
        this.paymentElement = elements.create('payment', options);
        this.paymentElement.mount(this.$el.querySelector(".checkout-element"));
        this.paymentElement.on("change", (event) => {
            if (event.complete) {
                this.showCheckoutButton = true;
            }
            else {
                this.showCheckoutButton = false;
            }
        });
        this.paymentElement.on("ready", (event) => {
            this.paymentInitialized = true;
        });
    },
    computed: {
        formattedPrice() {
            if (!this.plan.price) {
                return "Loading"
            } else {
                return `$${(this.plan.price / 100).toFixed(2)}`;
            }
        }
    },
    methods: {
        showStripePortal() {
            openStripePortal();
            this.$emit("close")
        },
        async getChangePlanInvoicePreview() {
            let result = await serverMethods.getChangePlanPricingStripe(this.plan.stripeId);
            if (await showHttpErrorIfExists(result)) return;
            this.paymentMethods = result.paymentMethodData;
            console.log(result, "was data", this.paymentMethods);
            this.paymentInitialized = true;
        },
        async downgrade() {
            this.checkingOut = true;
            let result = await serverMethods.downgradePlan(this.plan.id);
            this.checkingOut = false;
            if (await showHttpErrorIfExists(result)) return;
            showAlert({ title: "Success", content: "Your plan will be downgraded at the end of your current billing cycle." });
            this.$emit("close");
        },
        async doCheckout() {
            if (!this.showCheckoutButton || this.checkingOut) {
                return;
            }
            try {
                this.checkingOut = true;
                let returnUrl = window.location.href.replace(/\/$/, "");
                if (returnUrl.endsWith("/app")) {
                    returnUrl += "/";
                }
                let { error } = await this.stripe.confirmPayment({
                    elements: this.elements,
                    confirmParams: {
                        return_url: returnUrl
                        // return_url: window.location.origin + "/app/create?stripe-redirect=true"
                    },
                    redirect: "always"
                });
                if (error) {
                    this.error = error.message;
                }
            } catch (error) {
                this.error = error.message;
            } finally {
                this.checkingOut = false;
            }
        }
    }
})

</script>
<template>
    <div class="stripe-checkout">
        <div>
            <div>Stripe</div>
        </div>
        <div class="purchase-info">
            <img class="logo" src="@/assets/logo.avif" alt="Stripe" />
            <div class="purchase-details">
                <div class="item-name">{{ plan.name }} - {{ plan.credits }} credits per month</div>
                <div class="app-name">Dream Generator AI</div>
            </div>
            <div class="spacer"></div>
            <div style="display: flex; flex-direction: column;">
                <div class="price">{{ formattedPrice }}/mo</div>
            </div>
        </div>
        <!-- <div style="display: flex;">
            <div class="spacer"></div>
            <div class="credits">{{ plan.credits }} credits per month</div>
        </div> -->
        <div v-if="willDowngrade">
            <div>Downgrading your plan will take effect at the end of your current billing cycle.</div>
            <div>Are you sure you want to downgrade?</div>
            <br>
            <div>
                <btn @click="downgrade">{{ checkingOut ? "Working..." : "Downgrade" }}</btn>
            </div>
        </div>
        <div v-else-if="!paymentInitialized" class="loading">
            <v-progress-circular indeterminate></v-progress-circular>
        </div>
        <div class="checkout-element" :class="{ hidden: !paymentInitialized }"></div>
        <!-- <template v-else>
            <div>
                <div v-for="paymentMethod of paymentMethods" class="payment-method">
                    <div>
                        <img class="payment-method-brand-icon" :src="'/payment-method-icons/' + paymentMethod.brand + '.svg'" alt="paymentMethod.brand" />
                    </div>
                    <div>Ending in {{ paymentMethod.last4 }}</div>
                    <v-spacer />
                    <div>{{ paymentMethod.exp_month }}/{{ paymentMethod.exp_year }}</div>
                </div>
            </div>
            <div class="manage-payment-method" v-touchable @click="showStripePortal()">Manage Payment Method</div>
            <div class="prorated-amount">
                <div>Prorated Amount Due</div>
                <div>$</div>
            </div>
            <div>
                <btn class="checkout-button" @click="doCheckout">{{ checkingOut ? "Working..." : "Change Plan" }}</btn>
            </div>
        </template> -->
        <div v-if="showCheckoutButton">
            <btn class="checkout-button" @click="doCheckout">{{ checkingOut ? "Working..." : "Checkout" }}</btn>
        </div>
    </div>
</template>
<style lang="scss">
@import "@/scss/variables.scss";
.stripe-checkout {
    color: black;
    >* {
        border-bottom: 1px solid silver;
        padding: 15px;
    }
    .downgrade-notice {
        border-bottom: 1px solid silver;
        padding: 15px;
    }
    .prorated-amount {
        display: flex;
        justify-content: space-between;
    }
    .manage-payment-method {
        transition: .1s all;
        cursor: pointer;
        &.touch {
            background-color: gainsboro;
        }
    }
    .payment-method {
        display: flex;
        align-items: center;
        margin-bottom: 5px;
        padding: 5px;
        &:first-child {
            background-color: $primary; // #d4d4d4;
            color: white;
            border-radius: 3px;
        }
        &:last-child {
            margin-bottom: 0;
        }
        >* {
            margin-right: 10px;
        }
        >:last-child {
            margin-right: 0;
        }
    }
    .payment-method-brand-icon {
        width: 35px;
        display: flex;
    }
    .spacer {
        flex-grow: 1;
    }
    .purchase-info {
        display: flex;
        align-items: center;
        // flex-direction: column;
    }
    .logo {
        width: 50px;
    }
    .purchase-details {
        display: flex;
        flex-direction: column;
        margin-left: 10px;
        flex-shrink: 1;
        // flex-basis: 0;
        white-space: nowrap;
        overflow: hidden;
        //ellipsis
        text-overflow: ellipsis;
        >* {
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
        }
    }
    .item-name {
        font-size: 14px;
        font-weight: bold;
    }
    .app-name {
        font-size: 12px;
        color: gray;
    }
    .loading {
        display: flex;
        width: 100%;
        height: 100%;
        justify-content: center;
        align-items: center;
    }
    .checkout-element {
        // margin-top: 20px;    
        text-align: center;
        &.hidden {
            display: none;
        }
    }
    .checkout-button {
        // margin-top: 20px;
    }
}
</style>