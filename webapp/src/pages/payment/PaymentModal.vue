<script lang="ts">
import Vue, { defineComponent } from 'vue';
import axios from "axios";
import NavBar from "../../ui-elements/NavBar.vue"
import Features from "./Features.vue"
import Checkout from "../../sections/checkout/Checkout.vue";
// import showModal

export default defineComponent({
    components: { NavBar, Features, Checkout },
    props: ["isStandalone"],
    data() {
        return {
            search: ""
        }
    },
    mounted() {
        // showAlert({
        //     title: "Verification Required",
        //     content: "In order to combat spam, you must either use a social login, or start with a trial.  If you don\'t want to pay any money, just use social login, and you will get free credits to get started.  Enjoy!"
        // })
    },
    computed: {

    },
    methods: {

    }
})
</script>
<template>
    <div class="start-trial">
        <NavBar />
        <h4>Welcome to Dream Generator!</h4>
        <Features />
        <Checkout />
    </div>
</template>
<style lang="scss">
.start-trial {
    background: rgb(48, 48, 48);
    color: white;
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    h4 {
        margin: 15px 0 10px;
        text-align: center;
        font-size: 18px;
        font-weight: bold;
    }
}
</style>