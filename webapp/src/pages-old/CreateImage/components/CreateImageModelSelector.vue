<script lang="ts">
import { defineComponent } from 'vue';
import axios from "axios";

export default defineComponent({
    props: ["modelValue"],
    emits: ["update:modelValue"],
    data() {
        return { 
            search: "",
            models: null as { [modelName: string]: { creditCost: number, label: string } }
        }
    },
    mounted() {
        let currentModel = localStorage.getItem("currentCreateImageModel");
        if(currentModel) {
            this.$emit("update:modelValue", currentModel);
        }
        this.getCreateImageModels();
    },
    computed: {
        modelsList() {
            let list = [] as any[];
            for (let modelName in this.models) {
                list.push({ value: modelName, label: this.models[modelName].label });
            }
            return list;
        }   
    },
    methods: {
        async getCreateImageModels() {
            let response = await axios.get("/api/get-create-image-models");
            this.models = response.data.models;
            var found = false;
            for(var model in this.modelsList) {
                if(this.modelsList[model].value == this.modelValue) {
                    found = true;
                    break;
                }
            }
            if(!found) {
                this.$emit("update:modelValue", this.modelsList[0].value);
            }
        },
        selectItem(value) {
            localStorage.setItem("currentCreateImageModel", value);
            this.$emit('update:modelValue', value)
        }
    }
})
</script>
<template>
    <div class="create-image-model-selector" v-if="models">
        <v-select label="Quality" :modelValue="modelValue" @update:modelValue="selectItem" :items="modelsList" item-title="label" item-value="value" :hide-details="true"/>
    </div>
</template>
<style lang="scss">
.create-image-model-selector {}
</style>