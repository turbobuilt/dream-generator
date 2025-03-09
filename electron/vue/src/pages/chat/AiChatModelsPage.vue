<script lang="ts" setup>
import { computed, onMounted } from 'vue';
import { reactive } from 'vue';
import { store } from "../../store";
import { getModels } from '../../app/preload-old-connector';
import { Model } from '../../app/models/Model';
// import { getModels } from '../../app/preload-old-connector";

const d = reactive({
    prompt: '',
    loading: false,
    downloads: {} as any,
    models: {} as {[key: string]: Model}
});
onMounted(async () => {
    d.models = await getModels()
});


const textModels = computed(() => Object.values(d.models).filter(model => model.type == "text") || []);

</script>
<template>
    <div class="ai-chat-models-page menu-page">
        <v-card v-for="model in textModels" :key="model.id" :to="`/llm/${model.id}`">
            <v-card-title>{{ model.prettyName }}</v-card-title>
            <v-card-text>
                <!-- <v-icon>mdi-palette</v-icon> -->
            </v-card-text>
        </v-card>
    </div>
</template>
<style lang="scss">
.ai-chat-models-page {
    // padding: 10px;
    display: flex;
    .v-card {
        text-align: center;
        cursor: pointer;
        .v-card-title {
            font-size: 20px;
            font-weight: bold;
        }
    }
}
</style>