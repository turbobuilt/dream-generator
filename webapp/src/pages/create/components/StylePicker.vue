<script lang="ts">
import { defineComponent, onMounted, reactive } from 'vue';
// const styleNames = [
//     "none",
//     "photorealistic",
//     "3d-model",
//     "anime",
//     "digital-art",
//     "fantasy-art",
// ];
import defaultStyle from "../../../assets/styles/default-question.avif";
import photorealistic from "../../../assets/styles/photorealistic.avif";
import model from "../../../assets/styles/3d-model.avif";
import anime from "../../../assets/styles/anime.avif";
import digital from "../../../assets/styles/digital-art.avif";
import fantasy from "../../../assets/styles/fantasy-art.avif";




export default defineComponent({
    props: {
        style: String
    },
    data() {
        return {
            styles: [
                { label: "Default", url: defaultStyle, value: "" },
                { label: "Digital Art", url: digital, value: "digital-art" },
                { label: "Photorealistic", url: photorealistic, value: "photorealistic" },
                { label: "3D Model", url: model, value: "3d-model" },
                { label: "Anime", url: anime, value: "anime" },
                { label: "Fantasy Art", url: fantasy, value: "fantasy-art" },
            ]
        }
    },
    mounted() {
        // console.log("mounted");
        // let promises = [] as any;
        // for (let style of styleNames) {
        //     promises.push(import(`./${style}.avif!raw`));
        // }
        // Promise.all(promises).then((styles) => {
        //     this.styles = styles;
        //     console.log("styles", styles);
        // });
    },
    methods: {
        selected(style) {
            console.log("selected", style.value);
            this.$emit('update:style', style.value);
        }
    }
})

</script>
<template>
    <div class="style-picker no-scroll-bar">
        <div v-for="styleChoice of styles" class="style-container" :key="styleChoice.value" @click="selected(styleChoice)" :class="{ selected: styleChoice.value === style }">
            <div :style="{ backgroundImage: `url('${styleChoice.url}')` }" class="image"></div>
            <div class="label">{{ styleChoice.label }}</div>
        </div>
    </div>
</template>
<style lang="scss">
@import "../../../scss/variables.scss";
.style-picker {
    padding: 5px;
    overflow-x: auto;
    display: flex;
    white-space: nowrap;

    .style-container {
        flex-shrink: 0;
        $size: 70px;
        width: $size;
        margin-right: 8px;
        &.selected {
            outline: 3px solid $primary;
        }
        .label {
            text-align: center;
            font-size: 12px;
            font-weight: bold;
            text-overflow: ellipsis;
            overflow: hidden;
            white-space: nowrap;
        }
        .image {
            width: 100%;
            height: $size*.8;
            background-size: cover;
        }
    }
}
</style>