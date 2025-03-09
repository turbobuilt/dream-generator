export default {
    mounted(el, binding, vnode, prevVnode) {
        console.log("background-images mounted");
        let urls = binding.value;
        if (!Array.isArray(urls)) {
            urls = [urls];
        }
        // ::after
        let a = el.af
        let style = {
            height: el.clientHeight + "px",
            width: el.clientWidth + "px",
            transition: "all 1s",
            position: "absolute",
            top: "0",
            left: "0",
            zIndex: "-1",
            backgroundSize: "cover",
            backgroundPosition: "center",
        }
        Object.assign(a.style, style);
        Object.assign(b.style, style);
        el.appendChild(a);
        el.appendChild(b);

        function transition() {

        }
        transition();
        setInterval(transition, 1000);
    }
}