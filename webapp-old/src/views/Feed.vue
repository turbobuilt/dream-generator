<script lang="ts">
import axios from 'axios';
import { defineComponent } from 'vue'
import { store } from '../store';
export default defineComponent({
    name: 'Home',
    data() {
        return {
            results: [] as any[],
            loading: false,
            isFirstLoad: true,
            loadMoreStartCorrected: false,
            atStart: false,
            atEnd: false
        }
    },
    mounted() {
        document.body.addEventListener("scroll", this.onScroll)
    },
    unmounted() {
        document.body.removeEventListener("scroll", this.onScroll);
    },
    async created() {
        await this.loadResults();
    },
    methods: {
        async loadResults(direction: "forward" | "reverse" = "forward") {
            if (this.loading)
                return;
            if (this.atStart && direction == "reverse")
                return;
            try {
                this.loading = true;
                let params = {
                    direction,
                    isFirstLoad: this.isFirstLoad,
                };
                if (direction == "reverse" && this.results.length) {
                    params["first"] = this.results[0].position;
                }
                let res = await axios.get(`/api/feed`, {
                    params
                });
                let items = res.data.items;
                if (!items.length) {
                    if (direction == "forward") {
                        this.atEnd = true;
                    } else {
                        this.atStart = true;
                    }
                    this.isFirstLoad = false;
                    this.loading = false;
                    return;
                }
                for (let item of items) {
                    item.imageLoaded = false;
                    item.dataUrl = null;
                }
                // load all images
                let promises = await items.map(async item => {
                    console.log(store.baseImagePath + item.imagePath);
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
                this.results = direction == "forward" ? [...this.results, ...items] : [...items, ...this.results];
                this.$nextTick(() => {
                    let parent = this.$refs["scroll-container"] as HTMLElement;
                    let height = 0;
                    for (var i = 0; i < this.results.length; ++i) {
                        let item = this.results[i];
                        if (item.addAtFront) {
                            let element = parent.children[i + 1];
                            height += (element as HTMLElement).offsetHeight;
                            delete item.addAtFront;
                        }
                    }
                    if (this.loadMoreStartCorrected === false) {
                        let loadMoreStart = this.$refs["load-more-start"] as HTMLElement;
                        height += loadMoreStart.clientHeight;
                        this.loadMoreStartCorrected = true;
                    }
                    parent.scrollTop += height;
                    this.isFirstLoad = false;
                    this.loading = false
                })
            } catch (err) {
                this.loading = false;
                console.error(err);
            } finally {
            }
        },
        imageLoaded(event, item) {
            // console.log("image loaded", event);
        },
        onScroll(event: any) {
            console.log(event);
        },
        scrollContainerScrolled(event) {
            if (event.target.scrollTop < 600) {
                this.loadResults("reverse");
            } else if (event.target.scrollTop + event.target.clientHeight > event.target.scrollHeight - 600) {
                this.loadResults("forward");
            }

        }
    }
})
</script>
<template>
    <div class="feed-page">
        <div class="scroll-container" ref="scroll-container" @scroll="scrollContainerScrolled">
            <div class="load-more load-more-start" ref="load-more-start">
                <div v-if="loading" class="loading">Loading...</div>
                <div v-else-if="atEnd" class="at-end">At end</div>
            </div>
            <router-link v-for="(item, index) in results" :key="index" class="feed-item" :to="`/image/${item.id}`" :record-id="item.id">
                <img :src="`${item.dataUrl}`" @load="event => imageLoaded(event, item)" />
                {{ item.text }}
            </router-link>
            <div class="load-more load-more-end">
                <div v-if="loading && results?.length" class="loading">Loading...</div>
                <div v-else-if="atEnd" class="at-end">At end</div>
            </div>
        </div>
    </div>
</template>
<style lang="scss">
.feed-page {
    display: flex;
    flex-direction: column;
    min-height: 0;
    .load-more {
        height: 20px;
        width: 100%;
        text-align: center;
    }
    .scroll-container {
        overflow: auto;
        display: flex;
        flex-wrap: wrap;
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