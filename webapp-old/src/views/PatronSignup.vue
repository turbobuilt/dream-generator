<script lang="ts">
import LoginComponentVue from "@/components/LoginComponent.vue";
import { store } from "@/store";
import { defineComponent } from "vue";

export default defineComponent({
    components: { LoginComponentVue },
    data() {
        return {
            store: store
        }
    },
    mounted() {
        this.$watch(() => store.authenticatedUser, () => {
            if (store.authenticatedUser) {
                store.wantsToBePatron = true;
                this.$router.push("/payment");
            }
        }, { immediate: true });
    },
})
</script>
<template>
    <div class="patron-page">
        <br>
        <LoginComponentVue />
    </div>
</template>
<style lang="scss">
.patron-page {}
</style>