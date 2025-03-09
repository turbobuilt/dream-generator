<script lang="ts" setup>
import { computed, ref } from 'vue';
import ShareCard from '../../pages/feed/components/ShareCard.vue';
import Item from "./components/Item.vue";
import { onMounted } from 'vue';
import { reactive } from 'vue';
import { store } from "@/store";
import { onBeforeUnmount } from 'vue';
import { scrollend } from 'scrollyfills';
console.log(scrollend);

const props = defineProps<{
    items: any[];
    loadPrevious: () => Promise<any[]>;
    loadNext: (initialLoad: boolean) => Promise<any[]>;
}>();

let onTouchEndCallbacks = [];
let numTouches = 0;

const d = reactive({
    loadPreviousTimeout: null,
    loadNextTimeout: null,
    loadingPrevious: false,
    loadingNext: false,
    totalHeight: 0,
    minExtent: 0,
    hasSearchedPrevious: false,
    atEnd: false
})

const parent = ref(null);
const content = ref(null);

let visilityThreshold = store.isSafari ? 5000 : 1000;
let scrolling = false;

function onItemResize({ oldHeight, currentHeight, target }: { oldHeight: number, currentHeight: number, target: HTMLElement }, item, index) {
    var compute = () => {
        let growDown = false;
        if (item.addAtStart === true) {
            growDown = false;
        } else if (item.addAtEnd === true) {
            growDown = true;
        } else {
            // get item bounding box
            let boundingRect = target.getBoundingClientRect();
            // if item bottom is greater than the top of the scroll container, it is visible
            if (boundingRect.bottom > parent.value.getBoundingClientRect().top) {
                growDown = true;
            }
        }

        // for all items after, update top by height change
        // console.log("resizing", "index", index, "old height", oldHeight, "current height", currentHeight, "top", item.top, "grow down", growDown);
        let deltaHeight = currentHeight - (item.height || 0);

        item.height = currentHeight;
        d.totalHeight += deltaHeight;
        // console.log("Item bottom", item.bottom);
        if (item.bottom <= 0 && props.items.length > 0) {
            // console.log("delta height", deltaHeight);
            // console.log("current scroll height is", parent.value.scrollHeight, "current scroll top", parent.value.scrollTop);
            // get computed margin top
            // if (store.isSafari && numTouches > 0)
            //     onTouchEndCallbacks.push(() => {
            content.value.style.marginTop = parseFloat(content.value.style.marginTop || 0) + deltaHeight + "px"
            d.minExtent += deltaHeight;
            //     });
            // else {
            // content.value.style.marginTop = parseFloat(content.value.style.marginTop || 0) + deltaHeight + "px";
            // d.minExtent += deltaHeight;
            // }

            // get computed margin top
            // console.log("current scroll top is ", parent.value.scrollTop, "delta height", deltaHeight);
            const observer = new MutationObserver(() => {
                // console.log("mutation observed");
                // if (store.isSafari && numTouches > 0)
                //     onTouchEndCallbacks.push(() => parent.value.scrollTop += deltaHeight);
                // else
                parent.value.scrollTop += deltaHeight;
                observer.disconnect(); // Stop observing after the first change
            });
            observer.observe(content.value, { attributes: true, childList: true, subtree: true });

            // console.log("current scroll top is ", parent.value.scrollTop, "current scroll height", parent.value.scrollHeight);
        }

        if (growDown) {
            item.bottom = item.top + currentHeight;
            // for all following, update top and bottom by height change
            for (let i = index + 1; i < props.items.length; i++) {
                let item = props.items[i];
                if (item.top === undefined)
                    continue;
                item.top = item.top + deltaHeight;
                if (item.bottom === undefined || item.height === undefined)
                    continue;
                item.bottom = item.top + item.height;
            }
        } else {
            item.top = item.bottom - currentHeight;
            // for all previous, update top and bottom by height change
            for (let i = index - 1; i >= 0; i--) {
                let item = props.items[i];
                if (item.bottom === undefined)
                    continue;
                item.bottom = item.bottom - deltaHeight;
                if (item.top === undefined || item.height === undefined)
                    continue;
                item.top = item.bottom - item.height;
            }
        }
        // if next item exists and has no top, set top to bottom of this item
        if (props.items[index + 1] && props.items[index + 1].top === undefined) {
            props.items[index + 1].top = item.bottom;
        }
        // if previous item exists and has no bottom, set bottom to top of this item
        if (props.items[index - 1] && props.items[index - 1].bottom === undefined) {
            props.items[index - 1].bottom = item.top;
        }
        // if it's the last item, or the next item has no bottom, and bottom is greater than zero, set height of content
        if (index === props.items.length - 1 || !props.items[index + 1]?.bottom && item.bottom > 0) {
            content.value.style.minHeight = item.bottom + "px";
        }
    }
    if (store.isSafari && scrolling) {
        console.log("waiting on compute")
        onTouchEndCallbacks.push(compute);
    } else {
        compute();
    }
}

function onItemMounted(index) {
    const item = props.items[index];
    if (index === 0) {
        item.top = 0;
    }
}

// function onTouchStart(event) {
//     numTouches = event.touches.length;
//     return;
// }
// function onTouchEnd(event) {
//     if (event.touches.length === 0)
//         doToucheEndCallbacks();
// }
// function onTouchCancel(event) {
//     if (event.touches.length === 0)
//         doToucheEndCallbacks();
// }
function doScrollEndCallbacks() {
    scrolling = false;
    console.log("doing scroll end callbacks")
    onTouchEndCallbacks.forEach(callback => callback());
    onTouchEndCallbacks = [];
}

onMounted(async () => {
    d.loadingNext = true;
    console.log("loading next")
    let items = await props.loadNext(true);
    console.log("loaded")
    d.loadingNext = false;
    insertItemsAtEnd(items)
});
onBeforeUnmount(() => {
})

function insertItemsAtEnd(items: any[]) {
    if (items.length === 0)
        return;
    let itemsAtFront = [];
    if (props.items.length === 0) {
        for (let i = items.length - 1; i >= 0; i--) {
            if (items[i].addAtFront) {
                itemsAtFront.unshift(items.splice(i, 1)[0]);
            }
        }
        items[0].top = 0;
        items[0].hidden = false;
    } else {
        items[0].top = props.items.at(-1).bottom;
    }
    for (let item of items) {
        item.hidden = true;
        item.addAtEnd = true;
    }
    // console.log("items", items, "itemsAtFront", itemsAtFront)
    props.items.push(...items);
    checkVisibility();
    // setTimeout(() => {
    // console.log("info", props.items[0]?.top, itemsAtFront.length);
    if (props.items[0]?.top !== undefined && itemsAtFront.length > 0) {
        itemsAtFront.at(-1).bottom = props.items[0].top;
    }
    insertItemsAtStart(itemsAtFront);
    checkVisibility();
    // }, 1000)
    d.loadingNext = false;
}
function insertItemsAtStart(items: any[]) {
    // console.log("inserting at start", items.map(item => `${item.id} top: ${item.top} bottom: ${item.bottom}`));
    if (items.length === 0)
        return;
    for (let item of items) {
        item.hidden = true;
        item.addAtStart = true;
    }
    let last = items[items.length - 1]
    last.bottom = props.items[0].top;
    props.items.unshift(...items);
    d.loadingPrevious = false;
}

const visibleItems = computed(() => {
    // return props.items.filter(item => !item.hidden);
    let items = [];
    for (let i = 0; i < props.items.length; i++) {
        let item = props.items[i];
        if (!item.hidden) {
            items.push({ item, index: i });
        }
    }
    return items;
})

function scrolled(event) {
    console.log("scrolled")
    scrolling = true;
    // console.log("Scroll")
    let distanceFromTop = parent.value.scrollTop;
    // console.log("distance from top", distanceFromTop, "threshold", visilityThreshold);
    if (d.loadPreviousTimeout === null && distanceFromTop < visilityThreshold && props.items.length > 0 && props.items[0].top !== undefined) {
        // if (!d.loadPreviousTimeout) {
        console.log(">>>>>>>>> load previous scheduled");
        d.loadPreviousTimeout = setTimeout(async () => {
            try {
                console.log("LOADING PREVIOUS");
                d.loadingPrevious = true;
                d.hasSearchedPrevious = true;
                let items = await props.loadPrevious();
                d.loadingPrevious = false;
                console.log("got previoius items", items);
                insertItemsAtStart(items);
                checkVisibility();
            } catch (e) {
                console.error(e);
            } finally {
                d.loadPreviousTimeout = null;
            }
        }, 1000);
    }
    let distanceFromBottom = parent.value.scrollHeight - parent.value.clientHeight - parent.value.scrollTop;
    if (!d.atEnd && d.loadNextTimeout === null && distanceFromBottom < visilityThreshold && props.items[props.items.length - 1]?.bottom !== undefined) {
        d.loadNextTimeout = setTimeout(async function () {
            console.log("LOADING MORE");
            try {
                d.loadingNext = true;
                let items = await props.loadNext(false);
                d.loadingNext = false;
                if (items.length === 0) {
                    d.atEnd = true;
                    return;
                }
                insertItemsAtEnd(items);
                checkVisibility();
            } catch (e) {
                console.error(e);
            } finally {
                d.loadNextTimeout = null;
            }
        }.bind(this), 500);
    }
    checkVisibility();
}

function checkVisibility() {
    let scrollPosition = parent.value.scrollTop;
    let atBottom = scrollPosition + parent.value.clientHeight >= parent.value.scrollHeight;
    for (let i = 0; i < props.items.length; i++) {
        let item = props.items[i];
        if (item.top === undefined && item.bottom === undefined)
            continue;
        let bottomLimit = parent.value.offsetHeight + scrollPosition + visilityThreshold - d.minExtent
        let topLimit = scrollPosition - d.minExtent - visilityThreshold;
        // console.log("top limit", topLimit, "bottom", item.bottom)
        if ((item.top === undefined || item.top < bottomLimit) && (item.bottom === undefined || item.bottom > topLimit)) {
            if (item.hidden) {
                item.hidden = false;
                // console.log("unhiding", item.id)
            }
        } else if (!item.hidden) {
            if (atBottom) {
                // console.log("at bottom")
                break;
            }
            item.hidden = true;
            // console.log("hiding", item.id)
        }
    }
    // console.log("visibility", props.items.map((item, index) => `index: ${index} id:${item.id} ${item.hidden ? "hidden" : "visible"}`));
}

const lastVisibleItemBottom = computed(() => {
    for (var i = props.items.length - 1; i >= 0; i--) {
        if (!props.items[i].bottom !== undefined) {
            return props.items[i].bottom;
        }
    }
    return 0;
})

const firstVisibleItemTop = computed(() => {
    for (var i = 0; i < props.items.length; i++) {
        if (!props.items[i].top !== undefined) {
            return props.items[i].top;
        }
    }
})

</script>
<template>
    <!-- <div style="position: fixed; z-index: 100; background: white;">{{ itemIds }}</div> -->
    <div class="scroll-view" ref="parent" @scroll="scrolled" @scrollend="doScrollEndCallbacks">
        <div ref="spacer" style="width: 100%;"></div>
        <div v-if="d.loadingNext && !$props.items.length" style="height: 50vh; display: flex; flex-direction: column; justify-content: center; align-items: center;">
            <v-progress-circular indeterminate color="primary" />
        </div>
        <!-- <div v-if="!props.items.length && d.loadingNext" class="loading">Loading...</div> -->
            <div class="load-more load-more-start" ref="load-more-start" >
                <!-- <div>Loading...</div> -->
                <Transition name="fade">
                    <div v-if="d.loadingPrevious && props.items?.length" class="loading">
                         Loading...
                    </div>
                    <div v-else-if="!d.loadPreviousTimeout && props.items?.length" class="at-start loading"></div>
                    <!-- That's It! 😉</div> -->
                </Transition>
            </div>
        <div class="scroll-content" ref="content">
            <template v-for="{ item, index } in visibleItems" :key="item.id">
                <Item :index="index" @resize="(height) => onItemResize(height, item, index)" @mounted="() => onItemMounted(index)" :top="item.top">
                    <ShareCard :share="item" />
                    <!-- <div style="position: absolute; top: 0; left: 0; background: white; color: black; text-wrap: bread-word">{{ item.bottom }}</div> -->
                </Item>
            </template>
            <div class="load-more load-more-end" key="load-more-end" :style="{ transform: `translateY(${lastVisibleItemBottom}px)` }">
                <Transition name="fade">
                    <div v-if="(d.loadingNext || d.loadNextTimeout) && props.items?.length" class="loading">
                        <!-- <v-progress-circular color="primary" indeterminate></v-progress-circular> -->
                         Loading
                    </div>
                    <div v-else-if="props.items?.length" class="at-end loading">That's It! 😉</div>
                </Transition>
            </div>
        </div>
    </div>
</template>
<style lang="scss">
.scroll-view {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    min-height: 0;
    width: 100%;
    overflow: auto;
    .load-more {
        // position: absolute;
        // top: 0;
        // left: 0;
        // right: 0;
        // z-index: 10;
    }
    .load-more-start {
        height: 100px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .scroll-content {
        position: relative;
        display: flex;
        flex-grow: 1;
        min-height: 0;
        width: 100%;
    }
    .item-display {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        z-index: 1;
    }
}
</style>