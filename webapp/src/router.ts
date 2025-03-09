import { store } from '@/store'
import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router'
import { routes } from './routes';

// look for ?prompt= in url and set store.currentPromptInfo
let query = window.location.href.substring(window.location.href.indexOf("?")+1);
function getQueryVariable(variable) {
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        if (pair[0] == variable) { 
            return decodeURIComponent(pair[1]); 
        }
    }
    return (false);
}
console.log("query is", query, )

if (query.indexOf("prompt=") > -1) {
    let prompt = getQueryVariable("prompt");
    let style = getQueryVariable("style");
    let model = getQueryVariable("model");
    console.log("setting store.imageRequestSettings", { prompt, style, model });
    Object.assign(store.imageRequestSettings, { prompt, quantity: 1 });
    // now get rid of it in the query with replace
    console.log("replacing", window.location.search.replace(/prompt=[^&]+/, "").replace(/style=[^&]+/, "").replace(/model=[^&]+/, ""));
    window.history.replaceState(null, "", window.location.pathname);
    localStorage.removeItem("lastRoute");
}

let base = window.location.href.indexOf("/app/") > -1 ? "/app/" : "/";
const router = createRouter({
    // history: createWebHistory(base),
    history: createWebHashHistory(base),
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition
        } else {
            return { top: 0 }
        }
    },
    routes: routes
})
router.beforeEach((to, from, next) => {
    next();
    localStorage.setItem("lastRoute", to.fullPath);
});
export default router
