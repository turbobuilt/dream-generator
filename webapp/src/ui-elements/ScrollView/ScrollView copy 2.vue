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

const itemData = new WeakMap();
const parent = ref(null);
const content = ref(null);

let currentY = 0;
let totalHeight = 0;
let minExtent = 0

let visilityThreshold = 100;
let scrollChecking = false;
let lastScrollAnimationTime = 0;
let animatingScroll = false;
let lastFullUpdateTime = 0;
function checkScrollMotion() {
    if (scrollChecking)
        return;
    scrollChecking = true;
    doScrollMotion();
}
const deceleration = 2000;
let interpolatedDy = 0;
function doScrollMotion() {
    requestAnimationFrame(() => {
        console.log("animating", currentVelocity, "deltaTime", performance.now() - lastScrollAnimationTime, currentVelocity);
        let sign = currentVelocity < 0 ? -1 : 1;
        let deltaTime = (performance.now() - lastScrollAnimationTime) / 1000;
        lastScrollAnimationTime = performance.now();
        let currentSpeed = Math.abs(currentVelocity) - deceleration * deltaTime;
        console.log("speed", currentSpeed);
        if (currentSpeed < 0) {
            scrollChecking = false;
            currentVelocity = 0;
            console.log("scroll checking done");
            return;
        }
        currentVelocity = currentSpeed * sign;
        let dy = -currentVelocity * deltaTime;
        console.log("Dy is ", dy)

        if (performance.now() > lastFullUpdateTime + 30) {
            onWheel({ deltaY: dy, deltaTime });
            doScrollMotion();
            return;
        }
        // interpolatedDy += dy;
        // currentY += dy;
        updateY(dy);
        console.log("currentY", currentY, "dy", dy, "totalHeight", totalHeight, "parent.clientHeight", parent.value.clientHeight, "minExtent", minExtent);
        content.value.style.transition = "transform 0s";
        content.value.style.transform = `translateY(${currentY}px)`;

        // // console.log("scrolling", currentVelocity, "deltaTime", performance.now() - lastScrollAnimationTime, currentVelocity);
        // if (currentY + dy < minExtent) {
        //     dy = minExtent - currentY;
        //     currentVelocity = 0;
        // }
        // currentY += dy;
        // for (let i = 0; i < d.items.length; i++) {
        //     let item = d.items[i];
        //     if (item.top !== undefined) {
        //         item.top = item.top + dy;
        //     }
        //     if (item.bottom !== undefined) {
        //         item.bottom = item.bottom + dy;
        //     }
        // }
        doScrollMotion();
    });
}

function checkSupportsLinear() {
  const el = document.createElement('div');
  el.style.transition = 'transform 1s linear(0, 1)';
  return el.style.transition.includes('linear');
}
const supportsLinear = checkSupportsLinear();


function createDecelerationBezier(v, a) {
    const totalTime = v / a;

    const P0 = { x: 0, y: 0 };
    const P1 = { x: v / (3 * a), y: v / 3 };
    const P2 = { x: 2 * v / (3 * a), y: 2 * v / 3 };
    const P3 = { x: v / a, y: 0 };

    return `cubic-bezier(${P1.x / P3.x}, ${P1.y / v}, ${P2.x / P3.x}, ${P2.y / v})`;
}

function animateScroll(scrollingItem, v, a) {
    const totalTime = Math.abs(v / a);
    const bezierCurve = createDecelerationBezier(v, a);
    const totalDistance = (v * v) / (2 * a);
    console.log("total time", totalTime, "v", v, "a", a, "total Distance", totalDistance, bezierCurve);
    // const scrollingItem = document.getElementById('scrollingItem');
    scrollingItem.style.transition = `transform ${totalTime}s ${bezierCurve}`;
    scrollingItem.style.transform = `translateY(${totalDistance}px)`;
}


function getPosition(t) {
    // const a = v;
    const v = 2;
    const a = -2;
    // position is defined as x = v*t - 0.5*a*t^2
    return v * t + 0.5 * a * t * t;
}
function getAnimationLinear(t, step = .1) {
    let n = Math.ceil(t / step);
    let positions = [];
    for(let i = 0; i < n; i++) {
        positions.push(getPosition(i/n));
    }
    positions.push(getPosition(1));
    return `linear(${positions.join(", ")})`
    // console.log(positions);
}

function updateY(deltaY) {
    currentY -= deltaY;
    let distanceFromTop = minExtent - currentY;
    if (distanceFromTop < 0) {
        currentY = minExtent;
    }
    let distanceFromBottom = totalHeight - parent.value.clientHeight + currentY - minExtent; // + currentY + parent.value.
    if (distanceFromBottom < 0) {
        currentY = -totalHeight + parent.value.clientHeight + minExtent;
    }
    return { distanceFromTop, distanceFromBottom };
}

function onWheel(event) {
    let deltaY = event.deltaY;
    let { distanceFromTop, distanceFromBottom } = updateY(deltaY);

    content.value.style.transition = "transform 0s";
    content.value.style.transform = `translateY(${currentY}px)`;
    lastScrollAnimationTime = performance.now();
    lastFullUpdateTime = lastScrollAnimationTime;



    // console.log("currentY", currentY);
    // console.log("distance from top", distanceFromTop, "distance from bottom", distanceFromBottom, "total height", totalHeight);
    // return;
    let minVisibleYTop = -currentY;
    let minVisibleYBottom = parent.value.clientHeight - currentY;
    for (let i = 0; i < d.items.length; i++) {
        let item = d.items[i];
        if (item.top === undefined && d.items[i - 1]?.bottom !== undefined) {
            item.top = d.items[i - 1].bottom;
        } else if (item.bottom === undefined && d.items[i + 1]?.top !== undefined) {
            item.bottom = d.items[i + 1].top;
        }
        // console.log(i, item.top, item.bottom);
        if (item.top === undefined && item.bottom === undefined)
            continue;
        // console.log(i, "item.top", item.top, "minVisibleYBottom", minVisibleYBottom, "item.bottom", item.bottom, "minVisibleYTop", minVisibleYTop, "parent.clientHeight", parent.value.clientHeight);
        // console.log(i, (item.top - visilityThreshold < minVisibleYBottom || item.top === undefined), (item.bottom + visilityThreshold > minVisibleYTop || item.bottom === undefined));
        if ((item.top - visilityThreshold < minVisibleYBottom || item.top === undefined) && (item.bottom + visilityThreshold > minVisibleYTop || item.bottom === undefined)) {
            // console.log("showing", i);
            item.hidden = false;
        } else {
            item.hidden = true;
        }
    }

    if (!loadPreviousTimeout && distanceFromTop < 100 && d.items.length > 0 && d.items[0].top !== undefined) {
        loadPreviousTimeout = setTimeout(async () => {
            console.log("LOADING PREVIOUS");
            loadPreviousTimeout = null;
            d.loading = true;
            let items = await props.loadPrevious();
            d.loading = false;
            insertItemsAtStart(items);
        }, 1000);
    }

    // console.log(" the values", parent.value.clientHeight > totalHeight - 100);
    if (distanceFromBottom < 100 && !loadNextTimeout && d.items.at(-1).bottom !== undefined) {
        console.log("will load MORE");
        loadNextTimeout = setTimeout(async function () {
            console.log("LOADING MORE");
            loadNextTimeout = null;
            d.loading = true;
            let items = await props.loadNext(false);
            d.loading = false;
            insertItemsAtEnd(items);
        }.bind(this), 500);
    }
}

function onItemResize({ oldHeight, currentHeight, target }: { oldHeight: number, currentHeight: number, target: HTMLElement }, item, index) {
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
    console.log("resizing", index, oldHeight, currentHeight, "top", item.top);
    let deltaHeight = currentHeight - (item.height || 0);
    item.height = currentHeight;
    totalHeight += deltaHeight;
    if (item.bottom <= 0 && d.items.length > 0) {
        minExtent += deltaHeight;
    }

    if (growDown) {
        item.bottom = item.top + currentHeight;
        // for all following, update top and bottom by height change
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
        item.top = item.bottom - currentHeight;
        // for all previous, update top and bottom by height change
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
let positions = [];
let times = [];
function onTouchStart(event) {
    positions = [event.touches[0].clientY];
    times = [performance.now()];
    touchStartY = event.touches[0].clientY;
    lastTouchTime = performance.now();
    currentVelocity = 0;

    let computedStyle = window.getComputedStyle(content.value);
    let transform = computedStyle.getPropertyValue("transform");
    
    let yTransform = transform.split(",")[5]
    if (yTransform) {
        // console.log("yTransform", yTransform);
        // let parsed = parseFloat(yTransform.trim());
        // console.log("parsed currentY", currentY);
        // if (deltaY > 0 && parsed 
        currentY = parseFloat(yTransform.trim());
    }
    // console.log("currentY", currentY);
}
// let deltaY = 0;
// let deltaTime = 0;
function onTouchMove(event) {
    positions.push(event.touches[0].clientY);
    times.push(performance.now());
    console.log("positions", positions, "times", times);
    console.log("touch move", event.touches[0].clientY);
    let deltaY = event.touches[0].clientY - touchStartY;
    touchStartY = event.touches[0].clientY;
    let deltaTime = performance.now() - lastTouchTime;
    lastTouchTime = performance.now();
    // currentVelocity = deltaY / deltaTime;

    // // if distance is more than 5ms, compute velocity
    // if (performance.now() - times[0] > 5) {
    //     currentVelocity = (positions.at(-1) - positions[0]) / (times.at(-1) - times[0]);
    //     currentVelocity = currentVelocity * 1000;
    // } else {
    //     currentVelocity = 0;
    // }
    currentVelocity = deltaY / deltaTime * 1000;
    console.log("currentVelocity", currentVelocity);

    // min 5ms sample rate
    if(times[1] && times[1] < performance.now() - 5) {
        positions.shift();
        times.shift();
    }
    onWheel({ deltaY: -deltaY, deltaTime });
    lastScrollAnimationTime = performance.now();
    checkScrollMotion();
}
function onTouchEnd(event) {
    // touchStartY = 0;
    // let deltaY = event.touches[0].clientY - touchStartY;
    // touchStartY = event.touches[0].clientY;
    // let deltaTime = performance.now() - lastTouchTime;
    console.log("suports linear', supportsLinear" , supportsLinear);
    if (currentVelocity !== 0 && supportsLinear) {
        // currentVelocity = deltaY / deltaTime * 1000;
        console.log("currentVelocity", currentVelocity);
        let timeTillStop = Math.abs(currentVelocity) / deceleration;

        let distanceToStop = currentVelocity * timeTillStop - 0.5 * deceleration * timeTillStop * timeTillStop;
        console.log(`all ${timeTillStop}s ${getAnimationLinear(timeTillStop)}`);
        content.value.style.transitionTimingFunction = getAnimationLinear(timeTillStop);
        content.value.style.transition = `transform ${timeTillStop}s ${getAnimationLinear(timeTillStop)}`;
        content.value.style.transform = `translateY(${currentY + distanceToStop}px)`;
    } else {
        doScrollMotion();
    }
}
function onTouchCancel(event) {
    touchStartY = 0;
}
function transitionEnd(event) {

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



onMounted(async () => {
    d.loading = true;
    let items = await props.loadNext(true);
    insertItemsAtEnd(items)
});

function insertItemsAtEnd(items: any[]) {
    if (items.length === 0)
        return;
    for (let item of items) {
        item.hidden = true;
        item.addAtEnd = true;
    }
    if (d.items.length === 0) {
        items[0].top = 0;
        items[0].hidden = false;
    } else {
        items[0].top = d.items.at(-1).bottom;
    }
    d.items.push(...items);
    d.loading = false;
}
function insertItemsAtStart(items: any[]) {
    if (items.length === 0)
        return;
    for (let item of items) {
        item.hidden = true;
        item.addAtStart = true;
    }
    let last = items[items.length - 1]
    last.bottom = d.items[0].top;
    d.items.unshift(...items);
    d.loading = false;
}

const visibleItems = computed(() => {
    // return d.items.filter(item => !item.hidden);
    let items = [];
    for (let i = 0; i < d.items.length; i++) {
        let item = d.items[i];
        if (!item.hidden) {
            items.push({ item, index: i });
        }
    }
    return items;
})
</script>
<template>
    <div class="scroll-view" @wheel="onWheel" ref="parent" @touchstart="onTouchStart" @touchmove="onTouchMove" @touchend="onTouchEnd" @touchcancel="onTouchCancel">
        <div class="scroll-content" ref="content" style="display: flex; flex-direction: column; position: relative; position: absolute; top: 0; left: 0; right: 0;">
            <!-- <div class="load-more load-more-start" ref="load-more-start">
            <div v-if="loading" class="loading">
                <v-progress-circular color="primary" indeterminate></v-progress-circular>
            </div>
            <div v-else-if="atEnd && store.feedViewItems.length > 0" class="at-end">
                That's all your history!
            </div>
        </div> -->
            <template v-for="{ item, index } in visibleItems" :key="item.id">
                <!-- <template v-if="!item.hidden"> -->
                <Item :index="index" @resize="(height) => onItemResize(height, item, index)" @mounted="() => onItemMounted(index)" :top="item.top">
                    <div>{{ index }} {{ item.id }} {{ item.hidden }}</div>
                    <ShareCard :share="item" />
                </Item>
                <!-- </template> -->
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