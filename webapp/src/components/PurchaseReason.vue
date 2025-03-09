<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    name: "PurchaseReason",
    props: ["reason"],
    data() {
        return {

        }
    },
});
</script>
<template>
<div class="purchase-reason">
    <v-icon icon="mdi-check" color="success"/>
    <div>{{ reason }}</div>                   
</div>
</template>
<style lang="scss">
.purchase-reason {
    .v-icon {
        margin-right: 10px;
        font-size: 25px;
    }
    display: flex;
    // justify-content: space-between;
    align-items: center;
}
</style>
