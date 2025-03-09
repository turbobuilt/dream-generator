import Vue from 'vue';


function addTouchClass(event) {
    event.currentTarget.classList.add('touch');
}
function removeTouchClass(event) {
    event.currentTarget.classList.remove('touch');
}
export const touchable = {
    mounted(el) {
        el.addEventListener('touchstart', addTouchClass);
        el.addEventListener('mouseenter', addTouchClass);
        el.addEventListener('touchend', removeTouchClass);
        el.addEventListener('touchcancel', removeTouchClass);
        el.addEventListener('mouseleave', removeTouchClass);
        // console.log('touch directive mounted');
    },
    // on unmount remove
    unmounted(el) {
        el.classList.remove('touch');
        el.removeEventListener('touchstart', addTouchClass);
        el.removeEventListener('mouseenter', addTouchClass);
        el.removeEventListener('touchend', removeTouchClass);
        el.removeEventListener('touchcancel', removeTouchClass);
        el.removeEventListener('mouseleave', removeTouchClass);
        // console.log('touch directive unmounted');
    }
}