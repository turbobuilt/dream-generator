<script lang="ts">
import axios from 'axios';
import { defineComponent } from 'vue'
import { store } from '../../store'
import ShareCard from './components/ShareCard.vue'

export default defineComponent({
    components: { ShareCard },
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
    activated() {
        // console.log("activated");
        // document.body.addEventListener("scroll", this.onScroll)
        this.$refs["scroll-container"].scrollTop = this.scrollPosition;
    },
    deactivated() {
        console.log("deactivated");
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
        async loadResults(direction: "forward" | "reverse" = "forward") {
            if (this.loading)
                return;
            if (this.atStart && direction == "reverse")
                return;
            if (this.loadTimeout) {
                return;
            }
            if (this.lastLoadTime && Date.now() - this.lastLoadTime < 1000) {
                this.loadTimeout = setTimeout(() => {
                    this.loadTimeout = null;
                    this.loadResults(direction);
                }, Date.now() - this.lastLoadTime);
                return;
            }
            try {
                this.lastLoadTime = Date.now();
                this.loading = true;
                let params = {
                    direction,
                    isFirstLoad: this.isFirstLoad,
                };
                if (direction == "reverse" && store.feedViewItems.length) {
                    params["first"] = store.feedViewItems[0].position;
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
                store.feedViewItems = direction == "forward" ? [...store.feedViewItems, ...items] : [...items, ...store.feedViewItems];
                this.$nextTick(() => {
                    let parent = this.$refs["scroll-container"] as HTMLElement;
                    let height = 0;
                    for (var i = 0; i < store.feedViewItems.length; ++i) {
                        let item = store.feedViewItems[i];
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
                this.error = err.message;
                setTimeout(() => {
                    this.error = null;
                }, 10000);
                console.error(err);
            } finally {
            }
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


            console.log("scrollContainerScrolled", event.target.scrollTop, event.target.clientHeight, event.target.scrollHeight);
            if (event.target.scrollTop < 600) {
                this.loadResults("reverse");
            } else if (event.target.scrollTop + event.target.clientHeight > event.target.scrollHeight - 600) {
                this.loadResults("forward");
            }
            // now we need to remove items from the top or bottom that are not visible
            let parent = this.$refs["scroll-container"] as HTMLElement;
            let parentTop = parent.getBoundingClientRect().top;
            let loadMore = parent.firstElementChild as HTMLElement;
            let loadMoreHeight = loadMore.offsetHeight;
            for (var i = 0; i < 100; ++i) {
                let firstChild = parent.querySelector(".share-card") as HTMLElement;
                let firstChildHeight = firstChild.offsetHeight;
                let parentPaddingTop = parseInt(getComputedStyle(parent).paddingTop);
                console.log(parent.scrollTop, parentPaddingTop, firstChildHeight);
                if (parent.scrollTop - parentPaddingTop - loadMoreHeight > firstChildHeight) {
                    // must hide
                    console.log("must hide")
                }
                // if (firstChildHeight < )
                // let firstChildBottom = firstChild.getBoundingClientRect().bottom;
                // if (firstChildBottom < parentTop - 100) {
                //     console.log("first child is off the top");
                //     // remove all items off the top
                //     let index = parseInt(firstChild.id.slice(5));
                //     // save height
                //     store.feedViewItems[index].height = firstChild.offsetHeight;
                // } else {
                //     break;
                // }
            }

            // console.log(firstChild);
            // let lastChild = parent.children[parent.children.length - 1] as HTMLElement;
            // let firstChildTop = firstChild.offsetTop;
            // // check if first child is more than 200px off the top
            // console.log("firstChildTop", firstChildTop);
            // // if (firstChildTop < -200) {
            // //     // remove first child
            // //     let item = this.results.shift();
            // //     if (item) {
            // //         item.addAtFront = true;
            // //         this.results = [...this.results];
            // //     }
            // // }
        }
    }
})
</script>
<template>
    <div class="feed-page">
        <div class="scroll-container" ref="scroll-container" @scroll="scrollContainerScrolled">
            <div class="load-more load-more-start" ref="load-more-start">
                <div v-if="loading" class="loading">
                    <v-progress-circular color="primary" indeterminate></v-progress-circular>
                </div>
                <div v-else-if="atEnd && store.feedViewItems.length > 0" class="at-end">
                    That's all your history!
                </div>
            </div>
            <ShareCard v-for="(item, index) in store.feedViewItems" :key="item.id" :share="item" :id="'card_' + index" />
            <div class="load-more load-more-end">
                <Transition name="fade">
                    <div v-if="loading && store.feedViewItems?.length" class="loading">
                        <v-progress-circular color="primary" indeterminate></v-progress-circular>
                    </div>
                    <div v-else-if="atEnd" class="at-end">That's It! 😉</div>
                </Transition>
            </div>
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
        flex-grow: 1;
    }
    .scroll-container {
        overflow: auto;
        display: flex;
        flex-wrap: wrap;
        flex-grow: 1;
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