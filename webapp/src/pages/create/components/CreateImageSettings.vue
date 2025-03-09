<script lang="ts">
import { vars } from '@/lib/vars';
import { store } from '@/store';
import { defineComponent, ref, onMounted } from 'vue';
import ScrollSelect from '@/ui-elements/ScrollSelect.vue';
import { CreateImageRequestSettings } from '@/serverModels/CreateImageRequestSettings';
import { PropType } from 'vue';
import { serverMethods } from '@/serverMethods';
import { showHttpErrorIfExists } from '@/lib/handleHttpError';

interface Props {
    createImageViewState: {
        model: string;
    };
}

export default defineComponent({
    props: ["imageRequestSettings"],
    components: { ScrollSelect },
    async mounted() {
        let response = await serverMethods.getImageModels() as any;
        if (await showHttpErrorIfExists(response)) {
            return;
        }
        let modelsArray = [];
        for (let key in response) {
            modelsArray.push({ label: response[key].label, value: key, price: `${response[key].creditCost} Credit`, priceNumber: response[key].creditCost });
        }
        store.imageGenerationModels = modelsArray;
    },
    data() {
        return {
            model: "sdxl",
        };
    },
    computed: {
        filteredItems() {
            // if (store.authenticatedUser?.creditsRemaining < 1 && vars.isAndroid) {
            //     return store.imageGenerationModels.filter(item => item.value === "sdxl-turbo");
            // } else {
            return store.imageGenerationModels;
            // }
        }
    },
    methods: {
        async onSelectedItemChanged(event) {
            // console.log("onSelectedItemChanged", event.target.value);
        }
    }
});
</script>
<template>
    <div class="create-image-settings">
        <ScrollSelect :items="filteredItems" label="Quality" class="generation-option" v-model="imageRequestSettings.model" />
    </div>
</template>
<style lang="scss">
.create-image-settings {
    // Add your styles here
    margin-top: 5px;
    display: flex;
    .generation-option {
        line-height: 1;
        display: flex;
        align-items: center;
        margin-bottom: 10px;
        background: white;
        padding: 7px;
        font-size: 16px;
        label {
            font-size: 14px;
        }
        select {
            font-size: 16px;
            outline: none;
            margin-left: 10px;
            color: black;
        }
    }
}
</style>