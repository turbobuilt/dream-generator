<script lang="ts">
import { defineComponent } from 'vue';
import Feature from '../RegisterModal/Feature.vue';
import { loadStripe } from '@stripe/stripe-js';
import { stripePromise } from '@/main';
import axios, { AxiosResponse } from "axios";
import { store } from '@/store';
import { gtag_report_conversion } from "../../lib/reportGtagConversion";
import { getItemByKey } from '@/lib/arrayMethods';
import { reportFacebookConversion } from "../../lib/facebookConversion";

export default defineComponent({
    props: ["onSubscribe"],
    components: { Feature },
    data() {
        return {
            loadingStripe: true,
            paying: false,
            elements: null,
            collectingEmail: false,
            email: "",
            submittingEmail: false,
            stripeCustomerId: null,
            stripePaymentIntentId: null,
            error: "",
            paymentElement: null,
            plan: null,
            pollingEmailVerification: false,
            success: false,
            showLogin: false,
            showFreeSignup: false
        }
    },
    mounted() {
        this.start();
    },
    methods: {
        async start() {
            this.plan = getItemByKey(store.plans, "id", "normal_plan");
            const options = {
                mode: 'payment',
                amount: this.plan.price,
                currency: 'usd',
                appearance: {/*...*/ },
            };
            // Set up Stripe.js and Elements to use in checkout form
            let stripe = await stripePromise;
            this.elements = stripe.elements(options);
            // Create and mount the Payment Element
            // add padding
            this.paymentElement = this.elements.create('card', {
                style: {
                    base: {
                        padding: "16px",
                        boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)"
                    }
                }
            });
            this.paymentElement.mount('#payment-element');
            // autofocus on the card element
            this.paymentElement.focus();
            this.loadingStripe = false;
        },
        async submitPayment() {
            try {
                this.paying = true;
                this.error = "";
                let stripe = await stripePromise;
                console.log(this.elements)
                let stripeToken = await stripe.createToken(this.paymentElement);
                if (stripeToken.error) {
                    this.error = stripeToken.error.message;
                    return;
                }
                let response = await axios.post("/api/post-subscribe-token", {
                    planId: this.plan.id,
                    stripeToken: stripeToken.token.id
                });
                let { customerId, paymentIntentId } = response.data;
                this.stripeCustomerId = customerId;
                this.stripePaymentIntentId = paymentIntentId;

                let res = await axios.get("/api/authenticated-user");
                store.authenticatedUser = res.data.authenticatedUser;
                this.success = true;
            } catch (error) {
                this.error = error.response?.data?.error || error.message;
                console.error(error);
            } finally {
                this.paying = false;
            }

        },
        closeModalSuccess() {
            this.success = false;
            store.showingRegisterOrUpgradeModal = false;
        }
    }
})
</script>
<template>
    <div class="upgrade-modal">
        <div class="content">
            <h2>Time to Upgrade!</h2>
            <p>Please help support the business. We offer fair prices, and amazing service.</p>
            <p>For any questions contact <a href="mailto:hans@dreamgenerator.ai">hans@dreamgenerator.ai</a></p>
            <br>
            <div class="features">
                <Feature feature="Generate Images and Text" />
                <Feature feature="Access OpenAI Dalle 3!" />
                <Feature feature="Access Stable Diffusion" />
                <Feature feature="Help fund AI research for small business" />
                <Feature feature="Support Christian business" />
            </div>
            <br>
            <div id="payment-element"></div>
            <div v-if="error">
                <p style="color: red">{{ error }}</p>
            </div>
            <br>
            <div class="buttons">
                <v-btn color="primary" @click="submitPayment()">
                    <v-progress-circular v-if="paying" indeterminate color="white" :size="24" />
                    <div v-else>Activate For $1.99 a month</div>
                </v-btn>
            </div>
        </div>
    </div>
    <v-dialog v-model="success" persistent>
        <v-card :max-width="400" style="margin: 0 auto;">
            <v-card-title>Success</v-card-title>
            <v-card-text>
                All Set! Enjoy!
            </v-card-text>
            <v-card-actions>
                <v-btn color="primary" @click="closeModalSuccess()">Get Started!</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
<style lang="scss">
.upgrade-modal {
    padding: 10px;
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(0, 0, 0, 0.2);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100;
    .buttons {
        display: flex;
        justify-content: space-between;
    }
    .content {
        background: white;
        padding: 2rem;
        border-radius: 5px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        width: 100%;
        max-width: 600px;
    }
    #payment-element {
        padding: 8px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }
    .polling-email-verification-container {
        padding: 20px;
        display: flex;
        justify-content: center;
        flex-direction: column;
        align-items: center;
    }
    .try-free-container {
        text-align: center;
    }
    .try-free {
        text-decoration: underline;
        cursor: pointer;
        text-align: center;
    }
}
</style>