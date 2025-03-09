<script lang="ts" setup>
import { computed, ref } from 'vue';
import ShareCard from '../../pages/feed/components/ShareCard.vue';
import Item from "./components/Item.vue";
import { watch } from 'vue';
import { onMounted } from 'vue';
import { reactive } from 'vue';


const props = defineProps<{
    loadPrevious: () => Promise<any[]>;
    loadNext: (initialLoad: boolean) => Promise<any[]>;
}>();

let lastLoad = Date.now();
let loadNextTimeout = null;
let loadPreviousTimeout = null;

let currentVelocity = 0;
const d = reactive({
    items: [] as any[],
    loading: false
})
onMounted(async () => {
    d.loading = true;
    let items = await props.loadNext(true);
    for (let item of items) {
        item.hidden = true;
    }
    items[0].offset = 0;
    items[0].top = 0;
    items[0].bottom = 0;
    items[0].hidden = false;
    d.items.push(...items);
    d.loading = false;
});

const itemData = new WeakMap();
const parent = ref(null);

let currentY = 0;
let totalHeight = 0;
let minExtent = 0

let visilityThreshold = 200;
let scrollChecking = false;
let lastScrollAnimationTime = 0;
let lastFullUpdateTime = 0;
function checkScrollMotion() {
    if(scrollChecking)
        return;
    scrollChecking = true;
    doScrollMotion();
}
let interpolatedDy = 0;
function doScrollMotion() {
    return;
    requestAnimationFrame(() => {
        let sign = currentVelocity < 0 ? -1 : 1;
        let deltaTime = performance.now() - lastScrollAnimationTime;
        currentVelocity = Math.abs(currentVelocity) - .001 * deltaTime;
        console.log(currentVelocity);
        if (currentVelocity < 0) {
            scrollChecking = false;
            currentVelocity = 0;
            console.log("scroll checking done");
            return;
        }
        currentVelocity = currentVelocity * sign;
        let dy = currentVelocity * deltaTime;
        console.log("Dy is ", dy)

        if (performance.now() > lastFullUpdateTime + 30) {
            onWheel({ deltaY: -dy, deltaTime });
            doScrollMotion();
            return;
        }
        interpolatedDy += dy;

        // console.log("scrolling", currentVelocity, "deltaTime", performance.now() - lastScrollAnimationTime, currentVelocity);
        if (currentY + dy < minExtent) {
            dy = minExtent - currentY;
            currentVelocity = 0;
        }
        currentY += dy;
        for(let i = 0; i < d.items.length; i++) {
            let item = d.items[i];
            if(item.top !== undefined) {
                item.top = item.top + dy;
            }
            if(item.bottom !== undefined) {
                item.bottom = item.bottom + dy;
            }
        }
        lastScrollAnimationTime = performance.now();
        doScrollMotion();
    });
}

function onWheel(event) {
    let deltaY = event.deltaY + interpolatedDy;
    if (currentY + deltaY < minExtent) {
        deltaY = minExtent - currentY;
    }
    if (currentY + deltaY - minExtent > totalHeight - parent.value.clientHeight + 50) {
        deltaY = totalHeight - parent.value.clientHeight + 50 - currentY + minExtent;
    }
    currentY += deltaY;
    for (let i = 0; i < d.items.length; i++) {
        let item = d.items[i];
        if (d.items[i].top !== undefined) {
            item.top = item.top - deltaY;
        }
        if (item.bottom !== undefined && item.height !== undefined) {
            item.bottom = item.top + item.height;
        } else if (item.bottom !== undefined && i < d.items.length - 1 && d.items[i + 1].top !== undefined) {
            item.bottom = d.items[i + 1].top;
        }
    }
    let topThreshold = currentY + parent.value.clientHeight;

    // hide items that have gone off top
    // show items that have come back on screen
    for (let i = 0; i < d.items.length; i++) {
        // console.log(i, "top", d.items[i].top, "bottom", d.items[i].bottom, "parent clientHeight", parent.value.clientHeight);
        let item = d.items[i];
        if (item.bottom === undefined && d.items[i + 1]?.top !== undefined) {
            item.bottom = d.items[i + 1].top;
        }
        if (item.top === undefined && d.items[i - 1]?.bottom !== undefined) {
            item.top = d.items[i - 1].bottom;
            // console.log("adding top to ", i);
        }
        if (item.top === undefined && item.bottom === undefined) {
            continue;
        }
        if ((item.bottom >= 0 - visilityThreshold || item.bottom === undefined)
            && (item.top <= parent.value.clientHeight + visilityThreshold || item.top === undefined)) {
            item.hidden = false;
        } else {
            item.hidden = true;
        }
    }

    if (!loadPreviousTimeout) {
        // now check if we need to load more items
        // console.log("currentY", currentY, "minExtent", minExtent, "currentY - minExtent", currentY - minExtent, "d.items.length", d.items.length, "parent.value.clientHeight", parent.value.clientHeight);
        if (currentY - minExtent < 100 && d.items.length > 0) {
            loadPreviousTimeout = setTimeout(async () => {
                console.log("LOADING PREVIOUS");
                loadPreviousTimeout = null;
                d.loading = true;
                let items = await props.loadPrevious();
                d.loading = false;
                if (items.length === 0)
                    return;
                for (let item of items) {
                    item.hidden = true;
                    item._id = Date.now();
                }

                let firstExisting = items[0];
                let lastNew = items.at(-1);
                if (firstExisting.top !== undefined) {
                    lastNew.top = firstExisting.top;
                    lastNew.hidden = false;
                }
                d.items.unshift(...items);
            }, 1000);
        }
    }
    if (!loadNextTimeout) {
        // console.log(" the values", parent.value.clientHeight > totalHeight - 100);
        if (currentY - minExtent + parent.value.clientHeight > totalHeight - 100 || totalHeight < parent.value.clientHeight) {
            if (d.items.at(-1).bottom !== undefined) {
                console.log("will load MORE");
                loadNextTimeout = setTimeout(async function () {
                    console.log("LOADING MORE");
                    loadNextTimeout = null;
                    d.loading = true;
                    let items = await props.loadNext(false);
                    d.loading = false;
                    if (items.length === 0)
                        return;
                    for (let item of items) {
                        item.hidden = true;
                    }
                    let lastExisting = items.at(-1);
                    let firstNew = items[0];
                    if (lastExisting === undefined) { // if this is the only item, top is 0
                        firstNew.top = 0;
                    } else if (lastExisting.bottom !== undefined) {
                        firstNew.hidden = false;
                        firstNew.top = lastExisting.bottom;
                        if (lastExisting?.offset !== undefined && lastExisting.height !== undefined) {
                            firstNew.offset = lastExisting.offset + lastExisting.height;
                        }
                    }
                    d.items.push(...items);
                }.bind(this), 500);
            }
        }
    }
    lastFullUpdateTime = performance.now();
    lastScrollAnimationTime = performance.now();
    interpolatedDy = 0;
}

function onItemResize({ oldHeight, currentHeight }, item, index) {
    // let data = itemData.get(item);
    // if (!data) {
    //     data = { height: currentHeight };
    //     itemData.set(item, data);
    // }
    // data.height = currentHeight;

    // for all items after, update top by height change
    console.log("resizing", index, oldHeight, currentHeight, "top", item.top);
    let deltaHeight = currentHeight - (item.height || 0);
    item.height = currentHeight;
    totalHeight += deltaHeight;
    let addAtFront = false;
    if (item.top === undefined) {
        minExtent -= deltaHeight;
        addAtFront = true;
    }
    // if (item.bottom === undefined)


    console.log("item top", item.top, "item bottom", item.bottom, "deltaHeight", deltaHeight, "totalHeight", totalHeight);
    if (item.top >= -item.height || 0 && !addAtFront) {
        if (item.top !== undefined)
            item.bottom = item.top + currentHeight;
        else if (item.bottom !== undefined)
            item.top = item.bottom - currentHeight;

        // push others down
        for (let i = index + 1; i < d.items.length; i++) {
            let item = d.items[i];
            if (item.top === undefined)
                continue;
            item.top = item.top + deltaHeight;
            if (item.bottom === undefined || item.height === undefined)
                continue;
            item.bottom = item.top + item.height;
        }
    } else {
        if (item.bottom !== undefined)
            item.top = item.bottom - currentHeight;
        else if (item.top !== undefined)
            item.bottom = item.top + currentHeight;

        // push previous up
        for (let i = index - 1; i >= 0; i--) {
            let item = d.items[i];
            if (item.bottom === undefined)
                continue;
            item.bottom = item.bottom - deltaHeight;
            if (item.top === undefined || item.height === undefined)
                continue;
            item.top = item.bottom - item.height;
        }
    }

    let next = d.items[index + 1];
    if (next) {
        item.offset = next.offset - deltaHeight;
    }
    let previous = d.items[index - 1];
    if (previous) {
        item.offset = previous.offset + previous.height;
    }
    // if (item.atStart) {
    //     console.log("sizing start item", oldHeight, currentHeight);
    //     currentY += deltaHeight;
    //     item.bottom = d.items[index + 1].top;
    //     item.top = item.bottom - currentHeight;
    //     console.log("bottom", item.bottom, "top", item.top, "currentY", currentY, "deltaHeight", deltaHeight, "totalHeight", totalHeight);
    //     // minExtent -= deltaHeight;
    //     item.atStart = false;
    //     item.isNew = false;
    //     // set the previous item bottom at the top of this item if it exists
    //     if (index > 0) {
    //         d.items[index - 1].bottom = item.top;
    //     }
    // } else {
    // }
}

function onItemMounted(index) {
    console.log("mounted", index);
    const item = d.items[index];
    if (index === 0) {
        item.top = 0;
    }
}

// now emulate "wheel" with touch events, and call
let touchStartY = 0;
let lastTouchTime = 0;
function onTouchStart(event) {
    touchStartY = event.touches[0].clientY;
    lastTouchTime = performance.now();
    currentVelocity = 0;
}
function onTouchMove(event) {
    let deltaY = event.touches[0].clientY - touchStartY;
    touchStartY = event.touches[0].clientY;
    let deltaTime = performance.now() - lastTouchTime;
    lastTouchTime = performance.now();
    currentVelocity = deltaY / deltaTime;
    onWheel({ deltaY: -deltaY, deltaTime });
    lastScrollAnimationTime = performance.now();
    checkScrollMotion();
}
function onTouchEnd(event) {
    touchStartY = 0;
}
function onTouchCancel(event) {
    touchStartY = 0;
}


// let currentIds = [];
// watch(() => d.items, (newItems, oldItems) => {
//     let newIds = [];
//     for (let i = 0; i < newItems.length; i++) {
//         newIds.push(newItems[i].id);
//     }
//     if (currentIds.length == newIds.length) {
//         if (currentIds.length === 0) {
//             return;
//         }
//         // if first and last same, no change
//         if (currentIds[0] === newIds[0] && currentIds[currentIds.length - 1] === newIds[newIds.length - 1]) {
//             return;
//         }
//     }

//     let added = [];
//     let removed = [];
//     for (let i = 0; i < newIds.length; i++) {
//         if (!currentIds.includes(newIds[i])) {
//             added.push(newIds[i]);
//         }
//     }
//     for (let i = 0; i < currentIds.length; i++) {
//         if (!newIds.includes(currentIds[i])) {
//             removed.push(currentIds[i]);
//         }
//     }
// }, { deep: false, immediate: true });

</script>
<template>
    <div class="scroll-view" @wheel="onWheel" ref="parent" @touchstart="onTouchStart" @touchmove="onTouchMove" @touchend="onTouchEnd" @touchcancel="onTouchCancel">
        <!-- <div class="load-more load-more-start" ref="load-more-start">
            <div v-if="loading" class="loading">
                <v-progress-circular color="primary" indeterminate></v-progress-circular>
            </div>
            <div v-else-if="atEnd && store.feedViewItems.length > 0" class="at-end">
                That's all your history!
            </div>
        </div> -->
        <template v-for="(item, index) in d.items" :key="item.id">
            <template v-if="!item.hidden">
                <Item :index="index" @resize="(height) => onItemResize(height, item, index)" @mounted="() => onItemMounted(index)" :top="item.top">
                    <div>{{ index }} {{ item._id }}</div>
                    <ShareCard :share="item" :id="'card_' + index" v-if="!item.hidden" />
                </Item>
            </template>
        </template>
        <!-- <div class="load-more load-more-end">
            <Transition name="fade">
                <div v-if="loading && store.feedViewItems?.length" class="loading">
                    <v-progress-circular color="primary" indeterminate></v-progress-circular>
                </div>
                <div v-else-if="atEnd" class="at-end">That's It! 😉</div>
            </Transition>
        </div> -->
    </div>
</template>
<style lang="scss">
.scroll-view {
    display: flex;
    flex-grow: 1;
    min-height: 0;
    position: relative;
    overflow: hidden;
    width: 100%;
    .item-display {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        z-index: 1;
    }
}
</style>