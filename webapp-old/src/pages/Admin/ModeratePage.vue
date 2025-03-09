<script lang="ts">
import { defineComponent } from 'vue';
import axios from 'axios';
import { store } from '@/store';
import { handleHttpError } from '@/lib/handleHttpError';

export default defineComponent({
    data() {
        return {
            shares: [],
            page: 1,
            gettingItems: false
        }
    },
    mounted() {
        this.getItems(this.page);
    },
    methods: {
        async getItems(page) {
            try {
                if (this.gettingItems) return;
                this.gettingItems = true;
                let response = await axios.get(`/api/admin-shares?page=${page}`);
                this.shares = response.data.items;
                this.page = page;
            } catch (err) {
                // handleHttpError(err, "");
                console.log(err);
            } finally {
                this.gettingItems = false;
            }
        },
        async toggleFeatured(share) {
            try {
                let response = await axios.put(`/api/share-featured`, share);
                share.featured = response.data.share.featured;
            } catch (err) {
                // handleHttpError(err, "");
                console.log(err);
            } finally {

            }
        },
        async toggleSexualContent(share) {
            try {
                let response = await axios.put(`/api/put-toggle-shared-image-sexual-content`, share);
                share.sexualContent = response.data.sexualContent;
            } catch (err) {
                handleHttpError(err, "toggling sexual contet");
                console.log(err);
            } finally {

            }
        }
    }
});
</script>
<template>
    <div class="admin-page">
        <div class="tab-headers">
            <div>Featured Images</div>
        </div>
        <div class="tabs-body">
            <div>
                <div class="shares-container">
                    <div v-for="share in shares" class="share-container">
                        <img style="width:300px" :src="`https://images.dreamgenerator.ai/${share.path}`" />
                        <div class="toggle" @click="toggleFeatured(share)">
                            {{ share.featured ? "Featured" : "Not Featured" }}
                        </div>
                        <div class="toggle" @click="toggleSexualContent(share)">
                            {{ share.sexualContent ? "Sexual Content" : "Not Sexual Content" }}
                        </div>
                    </div>
                </div>
                <br>
                <div>
                    <button @click="getItems(page - 1)" :disabled="page == 1">Previous</button>
                    <button @click="getItems(page + 1)">Next</button>
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped lang="scss">
.admin-page {
    overflow: auto;
    .shares-container {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
    }
    .share-container {
        border: 2px solid gray;
        padding: 5px;
        margin: 10px;
    }
}
</style>