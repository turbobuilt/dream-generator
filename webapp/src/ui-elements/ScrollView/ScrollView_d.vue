<script lang="ts" setup>
import { computed, ref } from 'vue';
import ShareCard from '../../pages/feed/components/ShareCard.vue';
import Item from "./components/Item.vue";
import { watch } from 'vue';
import { onMounted } from 'vue';
import { reactive } from 'vue';
import { VListItemSubtitle } from 'vuetify/lib/components/index.mjs';


const props = defineProps<{
    items: any[];
    loadPrevious: () => Promise<any[]>;
    loadNext: (initialLoad: boolean) => Promise<any[]>;
}>();

let lastLoad = Date.now();
// let d.loadNextTimeout = null;
// let d.loadPreviousTimeout = null;

let currentVelocity = 0;
const d = reactive({
    // items: [] as any[],
    loadPreviousTimeout: null,
    loadNextTimeout: null,
    loadingPrevious: false,
    loadingNext: false,
    totalHeight: 0,
    minExtent: 0,
    hasSearchedPrevious: false,
})

const itemData = new WeakMap();
const parent = ref(null);
const content = ref(null);

let currentY = 0;
// let minExtent = 0

let visilityThreshold = 500;
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
        console.log("currentY", currentY, "dy", dy, "totalHeight", d.totalHeight, "parent.clientHeight", parent.value.clientHeight, "minExtent", d.minExtent);
        content.value.style.transition = "transform 0s";
        content.value.style.transform = `translateY(${currentY}px)`;
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
    for (let i = 0; i < n; i++) {
        positions.push(getPosition(i / n));
    }
    positions.push(getPosition(1));
    return `linear(${positions.join(", ")})`;
}

function updateY(deltaY) {
    currentY -= deltaY;
    let distanceFromTop = d.minExtent - currentY;
    if (distanceFromTop < 0) {
        currentY = d.minExtent;
    }
    let distanceFromBottom = d.totalHeight - parent.value.clientHeight + currentY - d.minExtent; // + currentY + parent.value.
    if (distanceFromBottom < 0) {
        currentY = -d.totalHeight + parent.value.clientHeight + d.minExtent;
    }
    return { distanceFromTop, distanceFromBottom };
}

function onWheel(event) {
    let deltaY = event.deltaY;
    let { distanceFromTop, distanceFromBottom } = updateY(deltaY);
    console.log("distance from top", distanceFromTop);

    content.value.style.transition = "transform 0s";
    content.value.style.transform = `translateY(${currentY}px)`;
    lastScrollAnimationTime = performance.now();
    lastFullUpdateTime = lastScrollAnimationTime;

    let minVisibleYTop = -currentY;
    let minVisibleYBottom = parent.value.clientHeight - currentY;
    for (let i = 0; i < props.items.length; i++) {
        let item = props.items[i];
        if (item.top === undefined && props.items[i - 1]?.bottom !== undefined) {
            item.top = props.items[i - 1].bottom;
        } else if (item.bottom === undefined && props.items[i + 1]?.top !== undefined) {
            item.bottom = props.items[i + 1].top;
        }
        // console.log(i, item.top, item.bottom);
        if (item.top === undefined && item.bottom === undefined)
            continue;
        if ((item.top - visilityThreshold < minVisibleYBottom || item.top === undefined) && (item.bottom + visilityThreshold > minVisibleYTop || item.bottom === undefined)) {
            // console.log("showing", i);
            item.hidden = false;
        } else {
            item.hidden = true;
        }
    }

    if (!d.loadPreviousTimeout && distanceFromTop < 100 && props.items.length > 0 && props.items[0].top !== undefined) {
        d.loadPreviousTimeout = setTimeout(async () => {
            console.log("LOADING PREVIOUS");
            d.loadingPrevious = true;
            return;
            d.loadPreviousTimeout = null;
            let items = await props.loadPrevious();
            d.loadingPrevious = false;
            insertItemsAtStart(items);
        }, 1000);
    }

    // console.log(" the values", parent.value.clientHeight > totalHeight - 100);
    if (distanceFromBottom < 100 && !d.loadNextTimeout && props.items.at(-1).bottom !== undefined) {
        console.log("will load MORE");
        d.loadNextTimeout = setTimeout(async function () {
            console.log("LOADING MORE");
            d.loadingNext = true;
            return;
            d.loadNextTimeout = null;
            let items = await props.loadNext(false);
            d.loadingNext = false;
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
    d.totalHeight += deltaHeight;
    console.log("Item bottom", item.bottom);
    if (item.bottom <= 0 && props.items.length > 0) {
        console.log("delta height", deltaHeight);
        d.minExtent += deltaHeight;
        content.value.style.marginTop = parseFloat(content.value.style.marginTop || 0) + deltaHeight + "px";
        parent.value.scrollTop += deltaHeight;
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
}

function onItemMounted(index) {
    console.log("mounted", index);
    const item = props.items[index];
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
        currentY = parseFloat(yTransform.trim());
    }
}


function onTouchMove(event) {
    positions.push(event.touches[0].clientY);
    times.push(performance.now());
    console.log("positions", positions, "times", times);
    console.log("touch move", event.touches[0].clientY);
    let deltaY = event.touches[0].clientY - touchStartY;
    touchStartY = event.touches[0].clientY;
    let deltaTime = performance.now() - lastTouchTime;
    lastTouchTime = performance.now();
    currentVelocity = deltaY / deltaTime * 1000;
    console.log("currentVelocity", currentVelocity);

    // min 5ms sample rate
    if (times[1] && times[1] < performance.now() - 5) {
        positions.shift();
        times.shift();
    }
    onWheel({ deltaY: -deltaY, deltaTime });
    lastScrollAnimationTime = performance.now();
    checkScrollMotion();
}
function onTouchEnd(event) {
    console.log("suports linear', supportsLinear", supportsLinear);
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

onMounted(async () => {
    d.loadingNext = true;
    let items = await props.loadNext(true);
    d.loadingNext = false;
    insertItemsAtEnd(items)
});

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
    console.log("items", items, "itemsAtFront", itemsAtFront)
    props.items.push(...items);
    checkVisibility();
    insertItemsAtStart(itemsAtFront);
    checkVisibility();
    d.loadingNext = false;
}
function insertItemsAtStart(items: any[]) {
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
    let distanceFromTop = parent.value.scrollTop;
    // console.log("distance from top", distanceFromTop, "total height", d.totalHeight, "parent.clientHeight", parent.value.clientHeight, "minExtent", d.minExtent);
    if (d.loadPreviousTimeout === null && distanceFromTop < visilityThreshold && props.items.length > 0 && props.items[0].top !== undefined) {
        d.loadPreviousTimeout = setTimeout(async () => {
            console.log("LOADING PREVIOUS");
            d.loadingPrevious = true;
            d.loadPreviousTimeout = null;
            d.hasSearchedPrevious = true;
            let items = await props.loadPrevious();
            d.loadingPrevious = false;
            insertItemsAtStart(items);
            checkVisibility();
        }, 1000);
    }
    let distanceFromBottom = parent.value.scrollHeight - parent.value.clientHeight - parent.value.scrollTop;
    if (d.loadNextTimeout === null && distanceFromBottom < visilityThreshold && props.items[props.items.length - 1]?.bottom !== undefined) {
        console.log("will load MORE");
        d.loadNextTimeout = setTimeout(async function () {
            console.log("LOADING MORE");
            d.loadingNext = true;
            d.loadNextTimeout = null;
            let items = await props.loadNext(false);
            d.loadingNext = false;
            insertItemsAtEnd(items);
            checkVisibility();
        }.bind(this), 500);
    }
    checkVisibility();
}

function checkVisibility() {
    let scrollPosition = parent.value.scrollTop;
    for (let i = 0; i < props.items.length; i++) {
        let item = props.items[i];
        if (item.top === undefined && item.bottom === undefined)
            continue;
        let bottomLimit = parent.value.offsetHeight + scrollPosition + visilityThreshold - d.minExtent
        let topLimit = scrollPosition - visilityThreshold - d.minExtent
        if ((item.top === undefined || item.top < bottomLimit) && (item.bottom === undefined || item.bottom > topLimit)) {
            item.hidden = false;
        } else {
            item.hidden = true;
        }
    }
}

const maxSafeInt = Number.MAX_SAFE_INTEGER
</script>
<template>
    <div class="scroll-view" ref="parent" @touchstart="onTouchStart" @touchmove="onTouchMove" @touchend="onTouchEnd" @touchcancel="onTouchCancel" @wheel="onWheel">
        <!-- <div class="load-more load-more-start" ref="load-more-start">
            <div v-if="d.loadingPrevious || d.loadPreviousTimeout" class="loading">
                <v-progress-circular color="primary" indeterminate></v-progress-circular>
            </div>
            <div v-else-if="props.items.length > 0 && d.hasSearchedPrevious" class="at-end">
                That's all your history!
            </div>
        </div> -->
        <div class="scroll-content" ref="content">
            <template v-for="{ item, index } in visibleItems" :key="item.id">
                <Item :index="index" @resize="(height) => onItemResize(height, item, index)" @mounted="() => onItemMounted(index)" :top="item.top">
                    <ShareCard :share="item" />
                </Item>
            </template>
        </div>
        <!-- <div class="load-more load-more-end">
            <Transition name="fade">
                <div v-if="(d.loadingNext || d.loadNextTimeout) && props.items?.length" class="loading">
                    <v-progress-circular color="primary" indeterminate></v-progress-circular>
                </div>
                <div v-else-if="props.items?.length" class="at-end">That's It! 😉</div>
            </Transition>
        </div> -->
    </div>
</template>
<style lang="scss">
.scroll-view {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    min-height: 0;
    width: 100%;
    overflow: hidden;
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