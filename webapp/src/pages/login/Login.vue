<script lang="ts">
import Vue, { defineComponent } from 'vue';
import axios from "axios";

import img_171 from "@/assets/images/171.avif";
import img_179 from "@/assets/images/179.avif";
import img_galaxy_big from "@/assets/images/galaxy_big.avif";
import img_lion from "@/assets/images/lion.avif";
import BackgroundSlideshow from '@/ui-elements/BackgroundSlideshow.vue';
import GoogleLoginButton from '@/components/GoogleLoginButton.vue';
import FacebookLoginButton from '@/components/FacebookLoginButton.vue';
import AppleLoginButton from '@/components/AppleLoginButton.vue';
import { setUserData } from '@/lib/auth';
import { store } from '@/store';
import MicrosoftLoginButton from '@/components/MicrosoftLoginButton.vue';

let backgroundImages = [img_171, img_179, img_galaxy_big, img_lion];

export default defineComponent({
    components: {
        BackgroundSlideshow,
        GoogleLoginButton,
        FacebookLoginButton,
        AppleLoginButton,
        MicrosoftLoginButton
    },
    props: [],
    data() {
        return {
            search: "",
            backgroundImages,
            store
        }
    },
    mounted() {

    },
    computed: {

    },
    methods: {
        loggedIn(data) {
            setUserData(data);
            this.$router.push("/");
        }
    }
})
</script>
<template>
    <div class="login">
        <div class="skip-sign-in-container" v-if="store.isApp">
            <btn class="skip-sign-in-button" to="/start-trial" :ripple="false">Skip Sign In</btn>
            <div style="margin-top: 10px; color: white;">Login highly recommended</div>
        </div>
        <div v-else class="skip-sign-in-container"></div>
        <div style="display: flex; flex-direction: column; align-items: center;">
            <h1 style="margin: 0; padding: 0; margin-bottom: 10px; color: white;">Dream Generator AI</h1>
            <!-- <div v-if="store.imageRequestSettings.prompt" class="one-more-step-container">
                <div>One more step!</div>
                <div>Please sign in to start your image generation.</div>
            </div> -->
            <div class="login-buttons" ref="loginButtons">
                <!-- <FacebookLoginButton /> -->
                <MicrosoftLoginButton @login="loggedIn" />
                <br />
                <AppleLoginButton @login="loggedIn" />
                <br />
                <GoogleLoginButton @login="loggedIn" />
                <br />
            </div>
        </div>
        <div></div>
        <BackgroundSlideshow :imagePaths="backgroundImages" />
        <!-- <BackgroundSlideshow :imagePaths="backgroundImages" /> -->
    </div>
</template>
<style lang="scss">
.login {
    // background-color: rgb(99, 73, 73);
    flex-grow: 1;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    // align-items: center;
    padding: 20px;
    .one-more-step-container {
        color: white;
        text-align: center;
        margin-bottom: 10px;
    }
    .login-buttons {
        width: 100%;
        max-width: 350px;
    }
    .skip-sign-in-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-top: 20px;
    }
    .skip-sign-in-button {
        background: rgba(0, 0, 0, .5);
        color: white;
        width: 100%;
        outline: none;
        border: none;
        box-shadow: 0 0 10px rgba(0, 0, 0, .5);
        border-radius: 5px;
        line-height: 1;
        padding: 8px;
    }
}
</style>