import { reactive } from "vue";

export const vars = reactive({
    isIos: window.navigator.userAgent.match(/(iPod|iPhone|iPad)/),
    isAndroid: window.navigator.userAgent.match(/Android/),
    isMobile: window.innerWidth < 768,
    isTablet: window.innerWidth >= 768 && window.innerWidth < 1024,
    isDesktop: window.innerWidth >= 1024,
    isLandscape: window.innerWidth > window.innerHeight,
    isPortrait: window.innerWidth < window.innerHeight,
    isDarkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
    isLightMode: window.matchMedia('(prefers-color-scheme: light)').matches,
    isReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    isNotReducedMotion: window.matchMedia('(prefers-reduced-motion: no-preference)').matches,
    isNotTouch: window.matchMedia('(hover: hover)').matches,
    isTouch: window.matchMedia('(hover: none)').matches,
})