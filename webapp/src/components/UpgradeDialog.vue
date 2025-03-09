<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    props: {
        modelValue: Boolean
    },
    methods: {
        updateModelValue(value: boolean) {
            this.$emit("update:modelValue", value);
        }
    }
})
</script>
<template>
    <div class="upgrade-dialog">
        <v-dialog width="500" :model-value="modelValue" @update:model-value="updateModelValue">
            <v-card>
                <v-card-text>
                    You need to upgrade to do multiple images at once
                </v-card-text>
                <v-card-actions>
                    <v-btn @click="$emit('update:modelValue', false)" variant="outlined">Close</v-btn>
                    <v-spacer />
                    <v-btn color="primary" :to="`/payment`" variant="elevated">Upgrade</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>