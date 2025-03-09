<script lang="ts">
import Vue, { defineComponent } from 'vue';
import axios from "axios";
import Plan from "./Plan.vue";
import { handleHttpError } from '@/lib/handleHttpError';
import { store } from '@/store';
import StripeCheckout from "./StripeCheckout.vue";
import { computed } from 'vue';
import { openStripePortal } from '@/lib/stripe';


async function getPlans() {
    try {
        let response = await axios.get(`/api/get-plans`);
        store.plans = response.data.items.sort((a, b) => b.price - a.price);
    } catch (err) {
        handleHttpError(err, "getting plans");
    } finally {

    }
}

export default defineComponent({
    components: { Plan, StripeCheckout },
    props: ["hideRestore", "modifying"],
    data() {
        return {
            search: "",
            gettingPlans: false,
            store
        }
    },
    async mounted() {
        await getPlans();
        if (store.authenticatedUser.plan) {
            store.selectedPlan = this.currentPlan;
        } else {
            store.selectedPlan = store.plans[0];
        }
    },
    computed: {
        currentPlan() {
            return store.plans.find(p => p.id == store.authenticatedUser.plan);
        },
        buttonText() {
            if (store.authenticatedUser.plan) {
                return "Change Plan";
            } else {
                return "Subscribe";
            }
        },
        formattedDay() {
            // return 1st, 2nd, 3rd, etc.
            let day = store.authenticatedUser.billingDayOfMonth;
            if (day == 1) return "1st";
            if (day == 2) return "2nd";
            if (day == 3) return "3rd";
            return day + "th";
        }
    },
    methods: {
        async startRestoreSubscription() {

        },
        purchaseClicked() {
            if (!store.selectedPlan) {
                return;
            }
            store.showingStripeModal = true;
        },
        changePlanClicked() {
            openStripePortal();
        }
    }
})


</script>
<template>
    <div class="checkout-component">
        <!-- <template v-if="store.authenticatedUser.plan">
            <Plan v-if="selectedPlan" v-model="selectedPlan" :plan="selectedPlan" />
            <div class="call-to-action-container">
                <btn class="call-to-action" color="primary" @click="changePlanClicked">{{ buttonText }}</btn>
            </div>
        </template> -->
        <!-- <template> -->
        <div v-if="store.authenticatedUser.downgradePlanTo === 'cancel'" class="cancellation notice">
            Your plan will be canceled at the end of the billing period.
        </div>
        <template v-else>
            <div v-if="store.authenticatedUser.billingDayOfMonth" class="plan-info">
                <div>Your plan currently renews on the {{ formattedDay }} day of each month.</div>
                <div>Your support is helping us build cool AI that will hopefully change the world one day!</div>
            </div>
            <div v-else-if="store.authenticatedUser.downgradePlanTo" class="downgrade-notice">
                Your plan will be downgraded to {{ store.plans.find(p => p.id == store.authenticatedUser.downgradePlanTo).name }} at the end of the billing period.
            </div>
            <div v-if="store.plans">
                <Plan v-for="plan of store.plans" v-model="store.selectedPlan" :plan="plan" :is-current="plan === currentPlan" />
            </div>
            <div class="call-to-action-container" v-if="store.selectedPlan && store.selectedPlan.id != store.authenticatedUser.plan">
                <btn class="call-to-action" color="primary" @click="purchaseClicked">{{ buttonText }}</btn>
            </div>
        </template>
        <div class="restore-subscription" v-if="!hideRestore && store.isApp">
            <div href="/restore-subscription" @click="startRestoreSubscription">Restore Subscription</div>
        </div>
        <!-- </template> -->
    </div>
</template>
<style lang="scss">
@import "../../scss/variables.scss";
.checkout-component {
    padding: 10px;
    .plan-info {
        padding: 10px 0;
    }
    .downgrade-notice {
        text-align: center;
        margin: 10px;
        color: black;
        font-weight: bold;
    }
    .call-to-action-container {
        display: flex;
        justify-content: center;
        margin-top: 30px;
    }
    .restore-subscription {
        text-align: center;
        margin-top: 35px;
        color: darken($primary, 10);
    }
}
</style>