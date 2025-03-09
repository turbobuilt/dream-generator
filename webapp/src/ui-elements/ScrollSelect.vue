<script>
import { defineComponent } from 'vue';
import { VueScrollPicker } from "vue-scroll-picker";
import "vue-scroll-picker/lib/style.css";


export default defineComponent({
    components: { VueScrollPicker },
    props: ["items", "label","modelValue"],
    data() {
        return {
            showing: false,
        }
    },
    computed: {
        selectedValue() {
            return this.items.find(item => item.value === this.modelValue)?.label || "";
        }
    }
})
</script>
<template>
    <div @click="showing = true" class="scroll-picker">
        <label>{{ label }}</label>
        <div class="scroll-select" v-if="selectedValue">
            {{ selectedValue }}
        </div>
        <Transition name="slide">
            <div class="scroll-picker-container" v-if="showing" @click.stop>
                <VueScrollPicker :options="items" :modelValue="modelValue" @update:modelValue="val => $emit('update:modelValue', val)" class="scroll-picker">
                    <template #default="{ option }">
                        <div class="option">{{ option.label }} - {{ option.price }}</div>
                    </template>
                </VueScrollPicker>
            </div>
        </Transition>
        <Transition name="opacity">
            <div class="scroll-picker-background" @click.stop="showing = false" v-if="showing"></div>
        </Transition>
    </div>
</template>
<style lang="scss">
.scroll-picker {
    .scroll-select {
        margin-left: 8px;
    }
}
.scroll-select {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
}
.scroll-picker-background {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    z-index: 99;
}
.scroll-picker-container {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 200px;
    background: white;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.6);
    z-index: 100;
    transition: all 0.3s ease-in-out;
    .scroll-picker {
        height: 100%;
        width: 100%;
        .option {
            height: 30px;
            display: flex;
            flex-shrink: 1;
            width: 100%;
            align-items: center;
            justify-content: center;
            text-align: center;
        }
    }
}
.slide-enter-to, .slide-leave-from {}
.slide-enter-from, .slide-leave-to {
    transform: translateY(100%);
}
.opacity-enter-active, .opacity-leave-active {
    transition: opacity 0.3s;
}
.opacity-enter, .opacity-leave-to {
    opacity: 0;
}
</style>