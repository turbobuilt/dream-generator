import Vue from 'vue';


let imgClone = null;
let imgRect = null;
let bg = null;
async function showImage(event) {

    let img = event.target;
    console.log(img, 'img');
    if (!img) return;

    bg = document.createElement('div');
    Object.assign(bg.style, { top: "0", left: "0", width: "100%", height: "100%", position: "fixed", backgroundColor: "rgba(0, 0, 0, 0.5)", zIndex: "999", opacity: "0", transition: "all .2s" });
    bg.addEventListener('click', hideImage);
    document.body.appendChild(bg);
    setTimeout(() => {
        bg.style.opacity = "1";
    }, 10);

    imgRect = img.getBoundingClientRect();
    let aspectRatio = imgRect.width / imgRect.height;

    let viewportWidth = window.innerWidth;
    let viewportHeight = window.innerHeight;
    let viewportAspectRatio = viewportWidth / viewportHeight;

    imgClone = img.cloneNode() as HTMLImageElement;
    imgClone.style.transition = 'all 0s';
    imgClone.style.position = 'fixed';
    imgClone.style.top = imgRect.top + 'px';
    imgClone.style.left = imgRect.left + 'px';
    imgClone.style.width = imgRect.width + 'px';
    imgClone.style.height = imgRect.height + 'px';
    imgClone.style.zIndex = '1000';
    imgClone.style.objectFit = 'contain';
    img.insertAdjacentElement('afterend', imgClone);
    imgClone.style.transition = 'all .2s';

    setTimeout(() => {
        imgClone.style.top = "0px";
        imgClone.style.left = "0px";
        imgClone.style.maxWidth = '100%';
        imgClone.style.maxHeight = '100%';
        imgClone.style.width = '100%';
        imgClone.style.height = '100%';
        imgClone.addEventListener('click', hideImage);
    }, 10);
}

function hideImage() {
    if (imgClone) {
        imgClone.style.maxWidth = null;
        imgClone.style.maxHeight = null;
        imgClone.style.width = imgRect.width + 'px';
        imgClone.style.height = imgRect.height + 'px';
        imgClone.style.top = imgRect.top + 'px';
        imgClone.style.left = imgRect.left + 'px';
        imgClone.style.transition = 'all .2s';
        bg.style.opacity = "0";
        setTimeout(() => {
            imgClone.remove();
            imgClone = null;
            bg.remove();
            bg = null;
        }, 200);
    }
}

export const zoomable = {
    mounted(el) {
        el.addEventListener('click', showImage);
    },
    unmounted(el) {
        el.removeEventListener('click', showImage);
    }
};