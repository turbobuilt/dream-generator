
import History from './pages/history/History.vue';
import Login from './pages/login/Login.vue';
import Create from "./pages/create/Create.vue"
import AiChatPage from './pages/ai-chat/AiChatPage.vue';
import EditImagePage from './pages/edit/EditImagePage.vue';
import Feed from './pages/feed/Feed.vue';
import SharePage from './pages/share/SharePage.vue';
import MySharesPage from './pages/my-shares/MySharesPage.vue';
import AccountPage from './pages/account/AccountPage.vue';
import Payment from "./pages/payment/PaymentModal.vue";
import TermsPage from './pages/terms/TermsPage.vue';
import PrivacyPage from './pages/privacy/PrivacyPage.vue';
import AdvancedCreate from './pages/create/AdvancedCreate.vue';
import AdvancedHistory from './pages/history/AdvancedHistory.vue';
import AuthenticatedUserProfilePage from './pages/authenticated-user-profile/AuthenticatedUserProfilePage.vue';
import RemoveBackgroundPage from './pages/remove-background/RemoveBackgroundPage.vue';
import MyProfilePage from './pages/my-profile-page/MyProfilePage.vue';
import PeoplePage from './pages/people/PeoplePage.vue';
import { name } from '@azure/msal-browser/dist/packageMetadata';
import ChatPage from './pages/chat/ChatPage.vue';
import Delete from './views/Delete.vue';
import TextToSpeechPage from './pages/text-to-speech/TextToSpeechPage.vue';

export const routes = [
    { path: '/', name: 'history', component: History },
    { path: '/login', name: 'login', component: Login },
    { path: '/advanced-create', name: 'advancedCreate', component: AdvancedCreate },
    { path: '/advanced-history', name: 'advancedHistory', component: AdvancedHistory },
    { path: '/start-trial', name: 'startTrial', component: Payment },
    { path: '/payment', name: 'payment', component: Payment },
    { path: '/text-to-speech', name: 'text-to-speech', component: TextToSpeechPage },
    { path: '/ai-chat', name: 'aiChat', component: AiChatPage },
    { path: '/edit-image', name: 'editImage', component: EditImagePage },
    { path: '/remove-background', name: 'removeBackground', component: RemoveBackgroundPage },
    { path: '/people', name: 'people', component: PeoplePage },
    { path: '/profile/:username', name: 'profile', component: AuthenticatedUserProfilePage },
    { path: '/feed', name: 'feedPage', component: Feed },
    { path: '/share/:id', name: 'share', component: SharePage },
    { path: '/chat', name: 'chat', component: ChatPage },
    { path: '/my-shares', name: 'myShares', component: MySharesPage },
    { path: '/account', name: 'account', component: AccountPage },
    { path: '/my-profile', name: 'myProfile', component: MyProfilePage },
    { path: '/terms', name: 'terms', meta: { hideMenu: true }, component: TermsPage },
    { path: '/privacy', name: 'privacy', meta: { hideMenu: true }, component: PrivacyPage },
    { path: '/organization/:id', name: 'organization', component: () => import("./pages/organization/OrganizationPage.vue") },
    { path: "/admin", name: "admin", component: () => import("./pages-old/Admin/MenuPage.vue") },
    { path: "/admin/moderate", name: "adminModerate", component: () => import("./pages-old/Admin/ModeratePage.vue") },
    { path: "/admin/automailer", name: "adminAutomailerList", component: () => import("./pages-old/Admin/Automailer/AutomailersListPage.vue") },
    { path: "/admin/automailer/:id", name: "adminAutomailer", component: () => import("./pages-old/Admin/Automailer/AutomailerPage.vue") },
    { path: "/admin/automailer-email/:id", name: "adminAutomailerEmail", component: () => import("./pages-old/Admin/Automailer/AutomailerEmailPage.vue") },
    { path: "/delete", name: "delete", component: Delete },
]