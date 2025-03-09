vc
<script lang="ts">
import Vue, { defineComponent } from 'vue';
import axios from "axios";
import { store } from '@/store';
import { mdiCheck } from '@mdi/js';

export default defineComponent({
    components: {},
    props: ["paymentIntent"],
    data() {
        return {
            done: false,
            store,
            error: "",
            mdiCheck
        }
    },
    mounted() {
        this.$watch("paymentIntent", (newVal, oldVal) => {
            if (newVal) {
                this.verifyPayment(newVal);
            }
        }, { immediate: true })
    },
    computed: {

    },
    methods: {
        async verifyPayment(paymentIntent) {
            // console.log("paymentIntent", paymentIntent);
            try {
                let response = await axios.post("/api/verify-stripe-payment", {
                    paymentIntent,
                    isNewVersion: true,
                    // isTest: store.isTest,
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
                store.selectedPlan = store.plans.find(p => p.id == plan);
                this.done = true;
            }
            catch (error) {
                console.error(error);
                this.error = "error processing payment.  Please do not try again, instead contact support@dreamgenerator.ai for help because it probably went through. " + (error?.response?.data?.error || error?.response?.data || error?.message || error);
                return;
            }
            console.log("paymentIntent", paymentIntent, this.$route.path);
            // let currentPath = window.location.href.replace(/https?:\/\/[^\/]+/,"").replace(/\?.*#/g, "");
            history.pushState(null, '', window.location.origin + window.location.pathname + window.location.hash);

            this.$router.replace(this.$route.path);
            await this.getCurrentSubscriptionInfo();
        }
    }
})
</script>
<template>
    <bottom-sheet :modelValue="paymentIntent" @update:modelValue="$emit('update:modelValue', $event)" :prevent-close="true">
        <div class="process-payment-modal">
            <template v-if="!done">
                <h2>Processing Payment...</h2>
                <div>
                    Please wait a moment
                </div>
                <div v-if="error" class="error">
                    {{ error }}
                </div>
            </template>
            <div v-else>
                <h2>Payment Successful</h2>
                <br>
                <div>
                    Your payment was successful! You now have {{ store.authenticatedUser.creditsRemaining }} credits remaining.
                </div>
                <br>
                <v-icon :path="mdiCheck" :size="20" color="success"></v-icon>
                <br>
                <btn @click="store.paymentIntent = null">Close</btn>
            </div>
        </div>
    </bottom-sheet>
</template>
<style lang="scss">
.process-payment-modal {
    padding: 15px;
    h2 {
        text-align: center;
    }
    .error {
        color: red;
    }
}
</style>