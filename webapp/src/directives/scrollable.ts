import { hrtime } from 'process';
import Vue from 'vue';

function calculateVelocity(start, end, time) {
    return (end - start) / time;
}

function calculateDuration(distance, velocity) {
    return Math.abs(distance / velocity);
}

function handleTouchStart(event, el) {
    event.preventDefault();
    el.startX = event.touches[0].clientX;
    el.startTime = new Date().getTime();
    el.style.transition = 'none';
}

function handleTouchMove(event, el) {
    event.preventDefault();
    const currentX = event.touches[0].clientX;
    const deltaX = currentX - el.startX;
    el.style.transform = `translateX(${el.currentX + deltaX}px)`;
}

function handleTouchEnd(event, el) {
    event.preventDefault();
    const endX = event.changedTouches[0].clientX;
    const endTime = new Date().getTime();
    const deltaX = endX - el.startX;
    const deltaTime = endTime - el.startTime;

    const velocity = calculateVelocity(el.startX, endX, deltaTime);
    const finalPosition = el.currentX + deltaX;
    const duration = calculateDuration(deltaX, velocity);

    el.style.transition = `transform ${duration}s cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
    el.style.transform = `translateX(${finalPosition}px)`;

    el.currentX = finalPosition;
}

let value = 0;

export const scrollable = {
    mounted(el) {
        return;
        let currentOffestY = 0;
        let lastTime = 0;
        let startY = 0;
        let startTransformY = 0;
        let currentY = 0;
        let elementHeight = 0;
        // el.style.transition = 'transform 0.5s';
        el.style.overflow = 'visible';
        function onTouchStart(event) {
            event.preventDefault();
            let startTransform = window.getComputedStyle(el).transform;
            startTransformY = startTransform && startTransform !== 'none' ? parseFloat(startTransform.split(',')[5]) : 0;
            startY = event.touches[0].clientY;
            currentY = startY;
            lastTime = performance.now();
            elementHeight = el.scrollHeight;
        }
        function onTouchMove(event) {
            // if (performance.now() - lastTime < 500)
            //     return;
            const newTime = performance.now();
            // console.log('touch move', event);
            event.preventDefault();

            // first update the location to match the current location
            const newY = event.touches[0].clientY;
            currentOffestY = startTransformY + newY - startY;
            // check if we are at the top or bottom
            console.log("elementHeight", elementHeight, "clientHeight", el.clientHeight, currentOffestY);
            let endOffsetY = el.clientHeight - currentOffestY;
            let stop = true;
            if (currentOffestY > 0) {
                currentOffestY = 0;
            } else if (endOffsetY > elementHeight) {
                currentOffestY = el.clientHeight - elementHeight;
            } else {
                stop = false;
            }

            el.style.transition = ``;
            // el.style.transform = `translateY(${currentOffestY}px)`;
            if (stop === true)
                return;


            const deltaY = currentY - newY;

            // now extrapolate where it will end
            const deltaTime = newTime - lastTime;
            const velocity = deltaY / deltaTime * 1000; // pixels per second
            const deceleration = 1000 // pixels per second per second
            const direction = velocity > 0 ? 1 : -1;
            let timeTillStop = Math.abs(velocity) / deceleration;
            console.log(">>>>>>>>>>>>>>>>")
            console.log("deltaY", deltaY)
            console.log("velocity", velocity)
            console.log("deltaTime", deltaTime)
            console.log("time till stop", timeTillStop)
            console.log("distance remaining", velocity * timeTillStop)
            console.log("current Y offset", currentOffestY);
            let finalLocation = currentOffestY - (velocity * timeTillStop) //+ direction * (0.5 * deceleration * timeTillStop ** 2);
            console.log("final location", finalLocation, "max scroll", endOffsetY);

            // if finalLocation > 0, compute the time it will take to reach 0, and set the transition time to that
            if (finalLocation > 0) {
                console.log("too small");
                const a = 0.5 * direction * deceleration;
                const b = -velocity;
                const c = currentOffestY;

                const discriminant = Math.sqrt(b ** 2 - 4 * a * c);
                const timeTillStop1 = (-b + discriminant) / (2 * a);
                const timeTillStop2 = (-b - discriminant) / (2 * a);

                // Choose the positive time value
                const timeTillStop = Math.max(timeTillStop1, timeTillStop2)
                finalLocation = 0;
                // now create a transition timing function that will take timeTillStop to hit 0, then additional time to "bounce" up and back
                console.log("timeTillStop", timeTillStop, "finalLocation", finalLocation);
                el.style.transition = `transform ${timeTillStop}s ease-out`;
                el.style.transform = `translateY(0px)`;
                return;
            } else if (-finalLocation > elementHeight) {
                console.log("too big");
                finalLocation = el.clientHeight - elementHeight;
                
                // timeTillStop = Math.abs((2 * velocity) / deceleration);
                // finalLocation = maxScroll;
                // console.log("timeTillStop", timeTillStop, "finalLocation", finalLocation);
                // el.style.transition = `transform ${timeTillStop}s ease-out`;
                el.style.transform = `translateY(${finalLocation}px)`;
                return;
            } 
            //else {
            //     // console.log("timeTillStop", timeTillStop);  
            //     el.style.transition = `transform ${timeTillStop}s ease-out`;
            //     el.style.transform = `translateY(${finalLocation}px)`;
            // }



            el.style.transition = `transform ${timeTillStop}s ease-out`;
            el.style.transform = `translateY(${finalLocation}px)`;

            // if (finalLocation > 0) {
            //     finalLocation = 0;
            // } else if (finalLocation < maxScroll) {
            //     finalLocation = maxScroll;
            // }
            console.log("finalLocation", finalLocation);

            currentY = newY;
            lastTime = newTime;



            // el.style.transform = `translateY(${currentOffestY}px)`;
            // el.style.transform = `translateY(${currentOffestY}px)`;



            // 
            // const timeTillStop = -velocity / deceleration;
            // const finalLocation = currentOffestY + (velocity * timeTillStop) - (0.5 * deceleration * timeTillStop ** 2);
            // el.style.transition = `transform ${timeTillStop}s linear`;
            // el.style.transform = `translateY(${finalLocation}px)`;
            // console.log('timeTillStop', timeTillStop, 'finalLocation', finalLocation);

            // // // compute where it will be when it stops scrolling
            // // const finalPosition = currentY + (velocity * time) - (0.5 * deceleration * time^2)
            // // const timeTillStop = -velocity / deceleration;
            // // // set animation duration, then set the final position
            // // el.style.transition = `transform ${timeTillStop}s cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
            // // el.style.transform = `translateY(${finalPosition}px)`;

            // startY = currentY;
            // startTime = performance.now();
        }

        el.addEventListener('touchstart', onTouchStart);
        el.addEventListener('touchmove', onTouchMove);
        el._onTouchStart = onTouchStart;
        el._onTouchMove = onTouchMove;




        // const onScroll = function(event) {
        //     console.log(event);
        //     event.preventDefault();
        //     value -= event.deltaY;
        //     el.style.transform = `translateY(${value}px)`;
        // }
        // // el.currentX = 0;
        // el.onScrollListener = onScroll;
        // // el.addEventListener("scroll", onScroll);
        // el.addEventListener('wheel', onScroll);
        // el.addEventListener('touchstart', (event) => handleTouchStart(event, el));
        // el.addEventListener('touchmove', (event) => handleTouchMove(event, el));
        // el.addEventListener('touchend', (event) => handleTouchEnd(event, el));
    },
    unmounted(el) {
        el.removeEventListener('touchstart', el._onTouchStart);
        el.removeEventListener('touchmove', el._onTouchMove);
        delete el._onTouchStart;
        delete el._onTouchMove;

        // el.removeEventListener('wheel', el.onScrollListener);
        // el.onScrollListener = null;
        // el.removeEventListener("scroll", onScroll);
        // el.removeEventListener('touchstart', (event) => handleTouchStart(event, el));
        // el.removeEventListener('touchmove', (event) => handleTouchMove(event, el));
        // el.removeEventListener('touchend', (event) => handleTouchEnd(event, el));
    }
};
