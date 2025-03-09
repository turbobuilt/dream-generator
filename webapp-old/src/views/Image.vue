<script lang="ts">
import { store } from '@/store';
// @ts-ignore
import { publishImage } from "../lib/publish"
import axios from 'axios';
import ImageDisplay from '@/components/ImageDisplay.vue';
import { deleteImage, getImage, getImages } from "../lib/imageSave";


// 128     // *4 2.5*d_model
// 512     // *4 2.25*d_model
// 2048    // *4 2.0*d_model
// 8192    // *4 1.75*d_model
// 32768   // *4 1.5*d_model 
// 131072  // *4 1.25*d_model 
// 524288  // *4


export default {
    data() {
        return {
            store,
            loading: false,
            first: null,
            isFirstLoad: true,
            sharedImage: null,
            publishing: false,
            error: ""
        };
    },
    computed: {
        image() {
            return store.currentImage || this.sharedImage;
        }
    },
    async mounted() {
        // scrol to top
        window.scrollTo(0, 0);
        if (store.currentImage || this.$route.params.shareId === 'local') {
            if(!store.currentImage) {
                store.currentImage = await getImage(this.$route.query.taskId);
            }
        } else if (this.$route.params.shareId) {
            this.loadImage(this.$route.params.shareId);
        }
    },
    beforeUnmount() {
        store.currentImage = null;
    },
    methods: {
        async publishImage(event) {
            try {
                if (this.publishing || this.image.shareId)
                    return;
                this.error = ""
                this.publishing = true;
                let share = await publishImage(this.image);
                this.image.shareId = share.id;
                // save to db
                let db = indexedDB.open("images", 1);
                db.onsuccess = () => {
                    let transaction = db.result.transaction("images", "readwrite");
                    let store = transaction.objectStore("images");
                    let {
                        url,
                        ...imageData
                    } = this.image;
                    console.log("image data is", imageData)
                    store.put(imageData);
                }
            } catch (err) {
                this.error = err.message;
                console.error(err);
            } finally {
                this.publishing = false;
            }
        },
        async loadImage(shareId) {
            try {
                this.loading = true;
                let response = await axios.get(`/api/share/${shareId}`);
                this.sharedImage = response.data;
            }
            catch (err) {
                console.error(err);
            }
            finally {
                this.loading = false;
            }
        },
        reImagine() {
            console.log(this.image);
            store.currentPromptInfo = { prompt: this.image.prompt, model: this.image.model, style: this.image.style };
            this.$router.push("/create");
        },
        async deleteImage() {
            await deleteImage(store.currentImage.taskId);
            this.images = await getImages();
            this.$router.back();
        }
    },
    components: { ImageDisplay }
};
</script>
<template>
    <div class="image-page" v-if="image">
        <div class="menu" v-if="store.authenticatedUser">
            <a class="menu-item important" @click="publishImage" v-if="image.arrayBuffer">
                <template v-if="publishing">Publishing...</template>
                <template v-else-if="image.shareId">Published</template>
                <template v-else>Publish</template>
            </a>
            <a class="menu-item" @click="reImagine()">ReImagine</a>
            <a class="menu-item" @click="deleteImage" v-if="$route.query.taskId">Delete</a>
        </div>
        <div class="error" v-if="error">{{ error }}</div>
        <ImageDisplay :url="image.url || store.baseImagePath + image.imagePath" />
    </div>
</template>
  
<style lang="scss">
.image-page {
    display: flex;
    flex-direction: column;
    // align-items: center;
    .error {
        color: red;
        padding: 10px;
        text-align: center;
    }
    .menu {
        display: flex;
        flex-direction: row;
        align-items: stretch;
        width: 100%;
        height: 50px;
        background: #333;
        color: white;
        .menu-item {
            padding: 10px 20px;
            cursor: pointer;
            display: flex;
            align-items: center;
            transition: .1s all;
            &.important {
                background: rgb(33, 150, 243);
                color: white;
                &:hover {
                    transform: scale(1.1);
                }
            }
        }
    }
    img {
        max-width: 100%;
        max-height: 100%;
    }
}
</style>
