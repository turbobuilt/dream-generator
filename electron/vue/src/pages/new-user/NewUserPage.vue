<script lang="ts">
import { defineComponent } from "vue";


export default defineComponent({
    
})
</script>
<template>
    <div class="new-user-page">
        <h1>Welcome to Dream Generator</h1>
        <div>Enjoy some of the best PRIVATE and LOCAL AI in the world</div>
        <div>Dream Generator lets you make images, get rid of background noise, and chat with smartest local AI bots available for your hardware (optimized for Intel OpenVINO)</div>
    </div>
</template>
<style lang="scss">
.new-user-page {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
    padding: 15px;
    background: rgb(117, 194, 17);
    h1 {
        font-size: 2em;
    }
    div {
        margin: 10px;
        text-align: center;
    }
}
</style>