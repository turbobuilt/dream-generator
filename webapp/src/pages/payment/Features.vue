<script lang="ts">
import Vue, { defineComponent } from 'vue';
import axios from "axios";
import { mdiCheck, mdiAccount } from "@mdi/js";

const icons = { mdiCheck }

export default defineComponent({
    props: [],
    data() {
        return {
            icons,
            search: "",
            features: [
                "Credits Never Expire While Subscribed",
                "1 credit buys one normal image",
                "8 credits buys one Super image",
                "1 credit buys 2600 chat tokens on fast model",
                "Help support small business and have fun",
                "Support ethical business and AI research to solve poverty"
            ]
        }
    },
    mounted() {

    },
    computed: {

    },
    methods: {

    }
})
</script>
<template>
    <div class="features-component">
        <div v-for="feature in features" :key="feature" class="feature">
            <v-icon :icon="icons.mdiCheck" color="#58f577" ></v-icon>
            <p>{{ feature }}</p>
        </div>
    </div>
</template>
<style lang="scss">
.features-component {
    padding: 10px;
    .feature {
        margin-bottom: 5px;
        display: flex;
        i {
            margin-right: 10px;
        }
    }
}
</style>