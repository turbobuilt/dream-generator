import { store } from '@/store'
import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router'

console.log("base is /app/")
let base = window.location.href.indexOf("/app/") > -1 ? "/app/" : "/";
console.log("base is " + base)
const router = createRouter({
    history: createWebHistory(base),
    routes: [
        { path: '/', name: 'create', component: () => import('./pages/CreateImage/Create.vue') },
        { path: '/create', name: 'create', component: () => import('./pages/CreateImage/Create.vue') },
        { path: '/edit', name: 'edit', component: () => import('./pages/EditImagePage/EditImagePage.vue') },
        { path: "/credits", name: "credits", component: () => import("./views/Credits.vue") },
        { path: "/feed", name: "feed", component: () => import("./views/Feed.vue") },
        { path: "/payment", name: "payment", component: () => import("./views/payment/Payment.vue") },
        { path: "/history", name: "history", component: () => import("./views/History.vue") },
        { path: "/delete", name: "delete", component: () => import("./views/Delete.vue") },
        { path: "/image", name: "showImage", component: () => import("./views/Image.vue") },
        { path: "/image/:shareId", name: "showImage", component: () => import("./views/Image.vue") },
        { path: "/advanced-settings", name: "advancedSettings", component: () => import("./views/AdvancedSettings.vue") },
        { path: "/patron-signup", name: "patronSignup", component: () => import("./views/PatronSignup.vue") },
        { path: "/chat", name: "chat", component: () => import("./pages/chat/ChatPage.vue") },
        { path: "/verify-email", name: "verifyEmail", component: () => import("./pages/VerifyEmail/VerifyEmailPage.vue") },
        { path: "/login", name: "login", component: () => import("./pages/Login/LoginPage.vue") },

        { path: "/admin", name: "admin", component: () => import("./pages/Admin/MenuPage.vue") },
        { path: "/admin/moderate", name: "adminModerate", component: () => import("./pages/Admin/ModeratePage.vue") },
        { path: "/admin/automailer", name: "adminAutomailerList", component: () => import("./pages/Admin/Automailer/AutomailersListPage.vue") },
        { path: "/admin/automailer/:id", name: "adminAutomailer", component: () => import("./pages/Admin/Automailer/AutomailerPage.vue") },
        { path: "/admin/automailer-email/:id", name: "adminAutomailerEmail", component: () => import("./pages/Admin/Automailer/AutomailerEmailPage.vue") },
        // { path: "/admin/automailer", name: "adminAutomailer", component: () => import("./pages/Admin/AdminAutomailerPage.vue") },
    ]
})

export default router
