<template>
    <v-dialog width="500" :modelValue="true" @update:modelValue="changed">
        <v-card>
            <v-card-text>
                {{ content }}
            </v-card-text>
            <v-card-actions>
                <v-btn color="primary" block @click="closeDialog">Ok</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
<script lang="ts">
export default {
    name: 'AlertDialog',
    props: ["content", "onClose"],
    methods: {
        closeDialog() {
            if (this.onClose) {
                this.onClose();
            }
        },
        changed(val) {
            if (!val) {
                this.closeDialog();
            }
        }
    }
}
</script>

<style scoped></style>
