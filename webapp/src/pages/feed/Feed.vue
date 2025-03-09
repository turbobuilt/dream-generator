<script lang="ts">
import axios from 'axios';
import { defineComponent } from 'vue'
import { store } from '../../store'
import ShareCard from './components/ShareCard.vue'
import ScrollView from "../../ui-elements/ScrollView/ScrollView.vue"
import ScrollViewSafari from "../../ui-elements/ScrollView/ScrollViewSafari.vue"

export default defineComponent({
    components: { ShareCard, ScrollView },
    data() {
        return {
            store,
            loading: false,
            isFirstLoad: true,
            loadMoreStartCorrected: false,
            atStart: false,
            atEnd: false,
            error: null,
            lastLoadTime: null as number,
            loadTimeout: null as number,
            visibleFeedViewItems: [] as any[],
            scrollView: null as any,
        }
    },
    mounted() {
        document.body.addEventListener("scroll", this.onScroll)
        // this.scrollView = ScrollView;
        // // // if mobile safari
        // let userAgent = navigator.userAgent.toLowerCase();
        // if (userAgent.includes("iphone") || userAgent.includes("ipad")) {
        //     this.scrollView = ScrollViewSafari;
        // } else {
        //     this.scrollView = ScrollView;
        // }
    },
    unmounted() {
        document.body.removeEventListener("scroll", this.onScroll);
    },
    async created() {
    },
    activated() {
        // console.log("activated");
        // document.body.addEventListener("scroll", this.onScroll)
        this.$refs["scroll-container"].scrollTop = this.scrollPosition;
    },
    deactivated() {
        // console.log("deactivated");
        this.scrollPosition = this.$refs["scroll-container"].scrollTop;
        // document.body.removeEventListener("scroll", this.onScroll);
    },
    // computed: {
    //     visibleFeedViewItems() {
    //         // return store.feedViewItems.filter(item => item.visible);
    //         let visible = [];
    //         for (let item of store.feedViewItems) {
    //             if (item.visible) {
    //                 visible.push(item);
    //             }
    //         }
    //         return visible;
    //     }
    // },
    methods: {
        async loadPrevious() {
            return this.loadResults("reverse");
        },
        async loadNext(initialLoad: boolean) {
            return this.loadResults("forward");
        },
        async loadResults(direction: "forward" | "reverse" = "forward") {
            try {
                let params = {
                    direction,
                    isFirstLoad: this.isFirstLoad,
                };
                this.isFirstLoad = false;
                if (direction == "reverse" && store.feedViewItems.length) {
                    params["first"] = (store.feedViewItems[0] as any).position;
                }
                let res = await axios.get(`/api/feed`, {
                    params
                });
                let items = res.data.items;
                for (let item of items) {
                    item.imageLoaded = false;
                    item.dataUrl = null;
                }
                // load all images
                let promises = await items.map(async item => {
                    let blob = await fetch(`${store.baseImagePath + item.imagePath}`, {
                        // cache: "force-cache"
                    }).then(r => r.blob());
                    let dataUrl = await new Promise((resolve, reject) => {
                        let reader = new FileReader();
                        reader.onload = () => resolve(reader.result);
                        reader.onerror = reject;
                        reader.readAsDataURL(blob);
                    });
                    item.dataUrl = dataUrl;
                })
                await Promise.allSettled(promises);
                return items;
            } catch (err) {
                this.loading = false;
                this.error = err.message;
                setTimeout(() => {
                    this.error = null;
                }, 10000);
                console.error(err);
            } finally {
            }
        }
    }
})
</script>
<template>
    <div class="feed-page">
        <div class="scroll-container" ref="scroll-container">
            <div  v-if="loading && !store.feedViewItems.length">
                <v-progress-circular indeterminate color="primary" />
            </div>
            <ScrollView v-else :items="store.feedViewItems" :load-next="loadNext" :load-previous="loadPrevious" />
        </div>
        <Transition name="height">
            <div v-if="error" class="error">{{ error }}</div>
        </Transition>
    </div>
</template>
<style lang="scss">
.feed-page {
    display: flex;
    flex-direction: column;
    min-height: 0;
    flex-grow: 1;
    .loading {
        // margin-top: 30vh;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-grow: 1;
    }
    .error {
        background: rgb(159, 31, 31);
        color: white;
        font-size: 14px;
        padding: 5px;
        height: 35px;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 5px;
    }
    .load-more {
        height: 50px;
        width: 100%;
        text-align: center;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-grow: 0;
        flex-shrink: 0;
    }
    .scroll-container {
        overflow: auto;
        display: flex;
        flex-direction: column;
        flex-wrap: wrap;
        flex-grow: 1;
        margin: 0 auto;
        width: 100%;
        max-width: 600px;
        .feed-item {
            // width: 300px;
            flex-grow: 1;
            background: white;
            img {
                max-width: 100%;
            }
        }
    }
}
</style>