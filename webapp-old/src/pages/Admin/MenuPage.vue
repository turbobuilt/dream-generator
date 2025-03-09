<script setup lang="ts">

</script>
<template>
    <div class="admin-menu-page">
        <v-card to="/admin/moderate">
            <v-card-title>Moderate</v-card-title>
        </v-card>
        <v-card to="/admin/automailer">
            <v-card-title>Automailer</v-card-title>
        </v-card>
    </div>
</template>
<style lang="scss">
.admin-menu-page {
    padding: 10px;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 10px;
}
</style>