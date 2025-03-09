<script>
</script>
<template>
    <!-- .content
	- for (i = 0; i < 9; i++)
		.cuboid
			- for (s = 0; s < 6; s++)
				.side -->
    <div class="fancy-loader">
        <div v-for="i in 9" :key="i" class="cuboid">
            <div v-for="s in 6" :key="s" class="side"></div>
        </div>
    </div>
</template>
<style lang="scss">
// get 
$vmin: 300px;
:root {
    --speed: 0.5s;
    /* change speed */
}
.fancy-loader {
    width: calc(30/100)*$vmin;
    height: calc(50/100)*$vmin;
    transform: rotateY(180deg) rotateZ(90deg) scale3d(01, 1.5, 0.5);
    transform-origin: center center;
    * {
        transform-style: preserve-3d;
        box-sizing: border-box;
    }
}
.cuboid {
    --height: 8 / 100;
    --width: 30 / 100;
    --depth: 30 / 100;
    --hue: 50;
    --sat: 90%;
    height: calc(var(--height) * 1*$vmin);
    width: calc(var(--width) * 1*$vmin);
    position: absolute;
    animation: loading var(--speed) cubic-bezier(0.4, 0, 1, 1) calc(calc(var(--speed) / 8) * -1) infinite alternate;
}
.cuboid .side {
    position: absolute;
    top: 50%;
    left: 50%;
    height: 100%;
    width: 100%;
    border-radius: 2px;
    /*border: 1px solid #0008;*/
    animation: rainbow calc(var(--speed) * 2) linear calc(calc(var(--speed) / 8) * -8) infinite;
}
@keyframes rainbow {
    0%, 10% {
        filter: hue-rotate(0deg);
    }
    10.1%, 20% {
        filter: hue-rotate(36deg);
    }
    20.1%, 30% {
        filter: hue-rotate(72deg);
    }
    30.1%, 40% {
        filter: hue-rotate(108deg);
    }
    40.1%, 50% {
        filter: hue-rotate(144deg);
    }
    50.1%, 60% {
        filter: hue-rotate(180deg);
    }
    60.1%, 70% {
        filter: hue-rotate(216deg);
    }
    70.1%, 80% {
        filter: hue-rotate(252deg);
    }
    80.1%, 90% {
        filter: hue-rotate(288deg);
    }
    90.1%, 100% {
        filter: hue-rotate(324deg);
    }
}
.cuboid .side:nth-of-type(1) {
    transform: translate3d(-50%, -50%, calc(var(--depth) * 0.5*$vmin));
    background: hsl(var(--hue), var(--sat), 60%);
}
.cuboid .side:nth-of-type(2) {
    transform: translate3d(-50%, -50%, calc(var(--depth) * -0.5*$vmin)) rotateY(180deg);
    background: hsl(var(--hue), var(--sat), 25%);
}
.cuboid .side:nth-of-type(3) {
    width: calc(var(--depth) * 1*$vmin);
    transform: translate(-50%, -50%) rotateY(90deg) translate3d(0, 0, calc(var(--width) * 0.5*$vmin));
    background: hsl(var(--hue), var(--sat), 75%);
}
.cuboid .side:nth-of-type(4) {
    width: calc(var(--depth) * 1*$vmin);
    transform: translate(-50%, -50%) rotateY(-90deg) translate3d(0, 0, calc(var(--width) * 0.5*$vmin));
    background: hsl(var(--hue), var(--sat), 40%);
}
.cuboid .side:nth-of-type(5) {
    height: calc(var(--depth) * 1*$vmin);
    transform: translate(-50%, -50%) rotateX(90deg) translate3d(0, 0, calc(var(--height) * 0.5*$vmin));
    background: hsl(var(--hue), var(--sat), 20%);
}
.cuboid .side:nth-of-type(6) {
    height: calc(var(--depth) * 1*$vmin);
    transform: translate(-50%, -50%) rotateX(-90deg) translate3d(0, 0, calc(var(--height) * 0.5*$vmin));
    background: hsl(var(--hue), var(--sat), 15%);
}
@keyframes loading {
    0% {
        margin-top: 0;
    }
    100% {
        margin-top: calc(7/100)*$vmin;
    }
}
.cuboid:nth-child(2) {
    top: calc(9/100)*$vmin;
    --height: 7 / 100;
    animation-delay: calc(calc(var(--speed) / 8) * -2);
}
.cuboid:nth-child(3) {
    top: calc(17/100)*$vmin;
    --height: 6 / 100;
    animation-delay: calc(calc(var(--speed) / 8) * -3);
}
.cuboid:nth-child(4) {
    top: calc(24/ 100)*$vmin;
    --height: 5 / 100;
    animation-delay: calc(calc(var(--speed) / 8) * -4);
}
.cuboid:nth-child(5) {
    top: calc(30/100)*$vmin;
    --height: 4 / 100;
    animation-delay: calc(calc(var(--speed) / 8) * -5);
}
.cuboid:nth-child(6) {
    top: calc(35/100)*$vmin;
    --height: 3 / 100;
    animation-delay: calc(calc(var(--speed) / 8) * -6);
}
.cuboid:nth-child(7) {
    top: calc(39/100)*$vmin;
    --height: 2 / 100;
    animation-delay: calc(calc(var(--speed) / 8) * -7);
}
.cuboid:nth-child(8) {
    top: calc(42/100)*$vmin;
    --height: 1 / 100;
    animation-delay: calc(calc(var(--speed) / 8) * -8);
}
.cuboid:nth-child(2) .side {
    /*filter: hue-rotate(6deg);*/
    animation-delay: calc(calc(var(--speed) / 8) * -9);
}
.cuboid:nth-child(3) .side {
    /*filter: hue-rotate(12deg);*/
    animation-delay: calc(calc(var(--speed) / 8) * -10);
}
.cuboid:nth-child(4) .side {
    /*filter: hue-rotate(18deg);*/
    animation-delay: calc(calc(var(--speed) / 8) * -11);
}
.cuboid:nth-child(5) .side {
    /*filter: hue-rotate(24deg);*/
    animation-delay: calc(calc(var(--speed) / 8) * -12);
}
.cuboid:nth-child(6) .side {
    /*filter: hue-rotate(30deg);*/
    animation-delay: calc(calc(var(--speed) / 8) * -13);
}
.cuboid:nth-child(7) .side {
    /*filter: hue-rotate(36deg);*/
    animation-delay: calc(calc(var(--speed) / 8) * -14);
}
.cuboid:nth-child(8) .side {
    /*filter: hue-rotate(42deg);*/
    animation-delay: calc(calc(var(--speed) / 8) * -15);
}
.cuboid:nth-child(9) {
    display: none;
    animation: none;
    --height: 51 / 100;
    --width: 32 / 100;
    --depth: 32 / 100;
    // transform: translateY(-0.5*$vmin) translateX(-1*$vmin) translateZ(0*$vmin);
    z-index: -1;
}
.cuboid:nth-child(9) .side {
    opacity: 0.5;
    filter: hue-rotate(30deg);
    box-shadow: 0 0 10*$vmin 2*$vmin #000000 inset, 0 0 1px 1px #0008;
    border: 5px solid #000000;
    border-width: 2px 8px 2px 7px;
    background: #cddc398c;
}
.cuboid .side:nth-of-type(5), .cuboid .side:nth-of-type(6) {
    border: none !important;
}
</style>