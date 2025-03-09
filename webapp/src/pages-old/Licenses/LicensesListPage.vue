<script lang="ts" setup>

</script>
<template>
    <div class="licenses-list-page">
        <h1>Licenses <v-btn size="small" to="/licenses/new">New</v-btn></h1>
        <v-card v-for="license in d.licenses" :key="license.id" :to="`/licenses/${license.id}`" >
            <v-card-text>{{license.name}} - {{ license.startTrigger }}</v-card-text>
        </v-card>
    </div>
</template>
<style lang="scss">
.licenses-list-page {
    
}
</style>