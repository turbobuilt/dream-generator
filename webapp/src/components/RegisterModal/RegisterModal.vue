<script lang="ts">
import { defineComponent } from 'vue';
import Feature from './Feature.vue';
import { loadStripe } from '@stripe/stripe-js';
import { stripePromise } from '@/main';
import axios, { AxiosResponse } from "axios";
import { store } from '@/store';
import { gtag_report_conversion } from "../../lib/reportGtagConversion";
import { getItemByKey } from '@/lib/arrayMethods';
import LoginModal from "./LoginModal.vue";
import { reportFacebookConversion } from "../../lib/facebookConversion";
import RegisterFreeModal from "./RegisterFreeModal.vue";

export default defineComponent({
    props: ["onSubscribe"],
    components: { Feature, LoginModal, RegisterFreeModal },
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
            showFreeSignup: false,
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
                this.collectingEmail = true;
                console.log(response);
            } catch (error) {
                this.error = error.response?.data?.error || error.message;
                console.error(error);
            } finally {
                this.paying = false;
            }

        },
        async submitEmail() {
            try {
                this.error = "";
                if (!this.email || !this.email.match(/.+@.+\..+/)) {
                    this.error = "Please enter a valid email";
                    return;
                }
                this.submittingEmail = true;
                let response = await axios.post("/api/post-subscribe-email-payment", {
                    email: this.email,
                    planId: this.plan.id,
                    stripeCustomerId: this.stripeCustomerId,
                    stripePaymentIntentId: this.stripePaymentIntentId
                });
                let { authenticatedUser, token } = response.data;
                localStorage.setItem("token", token);
                localStorage.setItem("accountCreated", "true");
                store.authenticatedUser = authenticatedUser;
                store.authenticatedUser
                store.token = token;
                console.log(response);
                this.collectingEmail = false;
                this.pollingEmailVerification = true;
                try {
                    gtag_report_conversion({ paymentIntentId: this.stripePaymentIntentId });
                } catch (err) {
                    console.error("Error reporting gtag conversion", err);
                }
                try {
                    reportFacebookConversion(this.plan.price);
                } catch (err) {
                    console.error("Error reporting facebook conversion", err);
                }
                this.startEmailVerificationPolling();
            } catch (error) {
                this.error = error.response?.data?.error || error.message;
                console.error(error);
            } finally {
                this.submittingEmail = false;
            }
        },
        async startEmailVerificationPolling() {
            let response: AxiosResponse = null;
            try {
                response = await axios.get("/api/get-poll-verify-email");
                if (response.data.verified) {
                    this.pollingEmailVerification = false;
                    this.success = true;
                }
            } catch (err) {
                console.error(err);
            } finally {
                if (!response?.data?.verified) {
                    setTimeout(() => this.startEmailVerificationPolling(), 1000);
                }
            }
        },
        closeModalSuccess() {
            if (this.onSubscribe) {
                this.onSubscribe();
            }
        },
        closeLoginClicked(closeRegisterModal = true) {
            this.showLogin = false;
            if (closeRegisterModal) {
                this.closeModalSuccess();
            }
        },
        freeSignupCancelled() {
            this.showFreeSignup = false;
            this.start();
        }
    }
})
</script>
<template>
    <div class="upgrade-modal">
        <div class="content">
            <LoginModal :close="closeLoginClicked" v-if="showLogin" />
            <RegisterFreeModal v-else-if="showFreeSignup" @cancel="freeSignupCancelled" @login="closeLoginClicked" />
            <template v-else>
                <div v-if="pollingEmailVerification" class="polling-email-verification-container">
                    <h2>Verify Your Email</h2>
                    <br>
                    <div>Please click the link sent to your email to verify your account (we don't want you to pay, and then not be able to access it later!)</div>
                    <br>
                    <div>If for some reason you don't get the email, please contact 214 842 3889, or email support@dreamgenerator.ai.</div>
                    <!-- <div>In the mean time, you can just refresh this page and you should be logged</div> -->
                    <br>
                    <v-progress-circular indeterminate></v-progress-circular>
                </div>
                <div v-else-if="!collectingEmail">
                    <h2>Get Started With AI!</h2>
                    <p>For just $1.99 a month, access OpenAI ChatGPT 4 (Normally $19.99 a month at OpenAI)</p>
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

                        <v-btn color="primary" @click="showLogin = true">
                            <div>Login</div>
                        </v-btn>
                    </div>
                    <div>
                        <br>
                        <div class="try-free-container">
                            <a class="try-free" @click="showFreeSignup=true">Or Try For Free</a>
                        </div>
                        <!-- <v-btn color="white" @click="$emit('close')">Or Try For Free</v-btn> -->
                    </div>
                

                    <!-- FeatureComponent("Credits Never Expire While Subscribed"),
            FeatureComponent("1 credit buys one normal image"),
            FeatureComponent("8 credits buys one Super image"),
            FeatureComponent("1 credit buys 2600 chat tokens on fast model"),
            FeatureComponent("Help support small business and have fun"),
            FeatureComponent("Support ethical business and AI research to solve poverty") -->
                    <!-- <button @click="$emit('close')">Close</button> -->
                </div>
                <div v-else>
                    <h2>Please Complete Your Subscription By Entering Your Email</h2>
                    <p>That way you can manage your account and log in.</p>
                    <p>You will be able to log in with just your email.</p>
                    <br>
                    <div v-if="error">
                        <p style="color: red">{{ error }}</p>
                    </div>
                    <v-text-field label="Email" v-model="email" @keyup.enter="submitEmail"></v-text-field>
                    <div class="buttons">
                        <v-btn color="primary" @click="submitEmail">
                            <v-progress-circular v-if="submittingEmail" indeterminate color="white" :size="24" />
                            <div v-else>Submit</div>
                        </v-btn>
                    </div>
                </div>
            </template>
        </div>
    </div>
    <v-dialog v-model="success" persistent>
        <v-card :max-width="400">
            <v-card-title>Success</v-card-title>
            <v-card-text>
                Your email has been verified! Enjoy!
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