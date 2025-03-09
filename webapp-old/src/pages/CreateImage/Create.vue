<script lang="ts">
import axios from 'axios';
import { defineComponent, reactive, type App } from 'vue'
import { store } from '../../store';
import ImageDisplay from '../../components/ImageDisplay.vue';
import LoginComponentVue from '../../components/LoginComponent.vue';
import UpgradeDialog from '../../components/UpgradeDialog.vue';
import CreateImageModelSelector from './components/CreateImageModelSelector.vue';
import FeatherIcon from '../../lib/FeatherIcon.vue';
import DisplayResultsModal from './components/DisplayResultsModal.vue';
import { ImageGenerationRequest, getImageGenerationRequestStatus } from "./components/getImageGenerationRequestStatus"


function createPromptRequest() {
    return reactive({
        prompt: "",
        quantity: 1,
        style: "None"
    });
}

export default defineComponent({
    name: 'Home',
    components: { ImageDisplay, LoginComponentVue, UpgradeDialog, CreateImageModelSelector, FeatherIcon, DisplayResultsModal },
    data() {
        return {
            promptRequest: createPromptRequest(),
            snackbarMessage: false as any,
            results: new Map<any, any>(),
            currentResultTask: null,
            imageGenerationRequests: [],
            showUpgradeDialog: false,
            quantityError: "",
            createImageError: "",
            showUpgradeButton: false,
            store,
            waitingForLogin: false,
            maxPromptsAtOnce: 2,
            model: "sdxl",
            pollStatusTimeout: null
        }
    },
    computed: {
        createButtonText() {
            if (this.imageGenerationRequests.length >= this.maxPromptsAtOnce)
                return "Only 2 prompts at a time for now..."
            if (this.promptRequest.prompt.length < 5)
                return (5 - this.promptRequest.prompt.length) + " More Characters"
            if (!store.authenticatedUser)
                return "Get Started!"
            return "Create"
        },
        showResults() {
            return this.results.size > 0;
        }
    },
    async mounted() {
        this.$router.isReady().then(() => {
            if (this.$route.query.prompt) {
                this.promptRequest.prompt = this.$route.query.prompt as string;
                this.$router.replace(this.$route.path);
                if (store.authenticatedUser) {
                    this.createImage();
                }
            } else if (store.currentPromptInfo?.prompt) {
                this.promptRequest.prompt = store.currentPromptInfo.prompt;
                this.promptRequest.style = store.currentPromptInfo.style;
                store.currentPromptInfo = null;
            }
        })
    },
    unmounted() {

    },
    async created() {

    },
    beforeUnmount() {
        store.loadingOrDisplayingImage = false;
    },
    methods: {
        async continueGeneration() {

        },
        async getModels() {

        },
        async createImage() {
            try {
                if (this.creatingUser)
                    return;
                this.createImageError = "";
                this.numTimesPolled = 0;
                store.loadingOrDisplayingImage = true;
                let imageGenerationRequest: ImageGenerationRequest = {
                    ...this.promptRequest,
                    taskIds: [],
                    pollAttempts: 0,
                    startTime: Date.now()
                };
                this.snackbarMessage = "Creating Image!"
                this.imageGenerationRequests.push(imageGenerationRequest);
                let args = { ...this.promptRequest }
                let response = await axios.post("/api/submit-image-generate-with-prompt", {
                    ...args,
                    model: this.model
                })
                let { taskId, error, code, taskIds } = response.data;
                imageGenerationRequest.taskIds = taskIds;
                if (code == "insufficient_credits") {
                    // this.showUpgradeButton = true;
                    (this.$root as any).showRegisterModal();
                    return;
                }
                if (error) {
                    this.imageGenerationRequests.splice(this.imageGenerationRequests.indexOf(imageGenerationRequest), 1);
                    this.createImageError = error;
                    if (code === "insufficient_credits") {
                        if (!store.authenticatedUser.email) {
                            this.createImageError = "You need to log in to do more images! This helps us keep track of who's doing what so we don't go broke.  Please subscribe to support the work!";
                            store.showLoginPage = true;
                        } else {
                            this.createImageError = "You don't have enough credits to do this.  Please subscribe to support the work!";
                        }
                    }
                    return;
                }
                this.promptRequest = createPromptRequest();
                this.currentTaskId = taskId.toString();
                if (!this.pollStatusTimeout)
                    this.pollStatusTimeout = setTimeout(() => getImageGenerationRequestStatus(this), 1000);
            } catch (err) {
                console.error(err);
                this.createImageError = err.message;
            }
        },
        closeResult() {
            for (let [key, value] of this.results.entries()) {
                if (value == this.currentResult) {
                    console.log("deleting result", key, value)
                    let deleted = this.results.delete(key);
                }
            }
            console.log("now results are", Array.from(this.results.entries()))
            this.currentResult = null;
            for (let [key, value] of this.results.entries()) {
                this.currentResult = value;
            }
        },
        updateQuantity(event) {
            let value = parseInt(event.target.value);
            if (store.authenticatedUser.creditsRemaining < 5) {
                if (value > 1) {
                    this.promptRequest.quantity = 0;
                    this.$nextTick(() => this.promptRequest.quantity = 1)
                    this.showUpgradeDialog = true;
                    console.log("showing upgrade dialog");
                    return;
                } else {
                    this.quantityError = "";
                }
            } else {
                this.quantityError = "";
            }
            console.log(value);
            this.promptRequest.quantity = value;
        }
    }
})
</script>
<template>
    <div class="create-page">
        <UpgradeDialog v-model="showUpgradeDialog" />
        <div class="top-input-row">
            <v-textarea label="What do you want to see?" rows="1" :auto-grow="true" v-model="promptRequest.prompt" @keypress.enter.prevent="promptRequest.prompt.length >= 5 ? createImage() : null" hide-details="auto" :autofocus="true" />
            <CreateImageModelSelector v-model="model" />
        </div>
        <div class="options">
            <v-text-field style="max-width: 200px" min="1" max="20" step="1" @input="updateQuantity" :modelValue="promptRequest.quantity" label="Quantity" type="number" :error-messages="quantityError" />
        </div>
        <v-btn :disabled="promptRequest.prompt.length < 5 || imageGenerationRequests.length >= maxPromptsAtOnce" color="primary" @click="createImage">{{ createButtonText }}</v-btn>
        <div class="create-image-error" v-if="createImageError">
            {{ createImageError }}
        </div>
        <div class="upgrade-button-container">
            <router-link v-if="showUpgradeButton" :to="`/payment`">
                <v-btn color="primary">Upgrade Now</v-btn>
            </router-link>
        </div>
        <!-- <div v-if="creatingUser">
            <div class="create-status">
                {{ currentStatus }}...
            </div>
            <div class="create-status-note">
                May take 30 seconds once it starts. You'll note it's "in progress" and then it takes about 15 to 20 seconds usually but could take longer.
            </div>
        </div> -->
        <h4 class="images-in-progress" v-if="imageGenerationRequests?.length">Images In Progress</h4>
        <div class="items-in-progress">
            <div v-for="info of imageGenerationRequests" class="item-in-progress">
                <v-progress-circular indeterminate color="primary" size="25" />
                <span>Painting your masterpiece! Count: {{ info.quantity }} {{ info.prompt }}</span>
            </div>
        </div>
        <DisplayResultsModal :imageGenerationRequests="imageGenerationRequests"/>
    </div>
    <!-- top right background green -->
    <v-snackbar v-model="snackbarMessage" :timeout="3000" location="top right" color="success">
        <div class="snackbar-content">
            <!-- <v-icon left size="30">mdi-check</v-icon> -->
            <FeatherIcon icon="check" size="30" />
            <span>{{ snackbarMessage }}</span>
        </div>
    </v-snackbar>
</template>
<style lang="scss">
.snackbar-content {
    display: flex;
    align-items: center;
    font-size: 18px;
    .feather-icon {
        margin-right: 10px;
    }
}
.images-in-progress {
    text-align: center;
    margin: 0;
    padding: 15px;
    font-weight: normal;
    background: whitesmoke;
    border-top: 1px solid gray;
}
.image-results {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    .image-result {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 50%;
        img {
            width: 100%;
        }
        &:first-child:last-child {
            width: 100%;
            max-width: 1024px;
        }
    }
    @media(max-width: 650px) {
        .image-result {
            width: 100%;
        }
    }
}
.create-page {
    .items-in-progress {
        display: flex;
        flex-direction: column;
        align-items: center;
        .item-in-progress {
            padding: 10px;
            background: whitesmoke;
            display: flex;
            justify-content: space-between;
            >span {
                margin-left: 15px;
            }
        }
    }
    .upgrade-button-container {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 10px;
    }
    .downloading-notice {
        text-align: center;
        margin: 10px;
    }
    .create-status-note {
        font-size: 14px;
        text-align: center;
        margin: 10px;
    }
    .output-img {
        max-width: 100%;
    }
    // height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    // .main-content {
    //     flex-grow: 1;
    // }
    .create-status {
        padding: 10px;
        text-align: center;
        font-weight: bold;
    }
    .create-image-error {
        color: red;
        margin: 10px;
        text-align: center;
    }
    .loader-container {
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .top-input-row {
        display: flex;
        .create-image-model-selector {
            width: 200px;
        }
        @media(max-width: 760px) {
            flex-direction: column;
            .create-image-model-selector {
                width: 100%;
            }
        }
    }
}
</style>