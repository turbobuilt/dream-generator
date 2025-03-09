<script lang="ts">
import Vue, { defineComponent } from 'vue';
import axios from "axios";

export default defineComponent({
    props: ["plan", "modelValue","isCurrent"],
    data() {
        return {
            search: ""
        }
    },
    mounted() {

    },
    computed: {
        price() {
            return "$" + this.plan.price / 100;
        },
        selected() {
            return this.plan === this.modelValue;
        }
    },
    methods: {
        updated(value) {
            console.log("updated", value);
            this.$emit("update:modelValue", this.plan);
        }
    }
})
</script>
<template>
    <div class="plan-component" :class="{ selected: selected }" @click="updated">
        <div style="display: flex; justify-content: space-between; align-items: center; background: white;">
            <div style="display: flex; align-items: center;">
                <v-radio label="" value="one" :modelValue="selected" :trueValue="true" :falseValue="false" density="compact" />
                <div style="font-weight: bold;margin-left: 5px;" v-if="isCurrent">Your Plan</div>
            </div>
            <div class="plan-name">{{ plan.name }}</div>
        </div>
        <transition name="height">
            <div v-if="selected" class="credits-info">
                <div style="margin-bottom: 2px; margin-top: 3px;">{{ plan.credits }} Credits Monthly</div>
                <div>{{ price }}</div>
            </div>
        </transition>
    </div>
</template>
<style lang="scss">
@import "../../scss/variables.scss";
.plan-component {
    background-color: white;
    border-radius: 5px;
    margin-top: 10px;
    color: black;
    padding: 5px;
    line-height: 1;
    font-size: 15px;
    .credits-info {
        height: 35px;
        display: flex;
        flex-direction: column;
        justify-content: space-around;
    }
    .v-selection-control__wrapper, .v-selection-control__input {
        width: auto;
        height: auto;
    }
    svg {
        // stroke: $primary;
        margin-left: -2px;
        fill: $primary;
    }
    i {
        opacity: 1 !important;
    }
    &.selected {
        outline: 2px solid $primary;
        box-shadow: 0 0 10px 0 rgba(255, 255, 255, 0.9);
    }
    .plan-name {
        font-weight: bold;
    }
}
</style>