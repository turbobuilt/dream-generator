import { createMemoryHistory, createRouter } from 'vue-router'
import AudioMenuPage from '../pages/audio/AudioMenuPage.vue'
import ImagesMenuPage from '../pages/image/ImagesMenuPage.vue'
import AiChatPage from '../pages/chat/AiChatPage.vue'
import RemoveBackgroundNoisePage from '../pages/audio/RemoveBackgroundNoisePage.vue'
import TextToImagePage from '../pages/image/TextToImagePage.vue'
import AiChatModelsPage from '../pages/chat/AiChatModelsPage.vue'
import LicenseListPage from '../pages/licenses/LicenseListPage.vue'
import LicensePage from '../pages/licenses/LicensePage.vue'
import InfoPage from '../pages/info/InfoPage.vue'
import NewUserPage from '../pages/new-user/NewUserPage.vue'

const routes = [
    { path: '/audio', component: AudioMenuPage },
    { path: '/audio/remove-noise', component: RemoveBackgroundNoisePage },
    { path: '/image', component: ImagesMenuPage },
    { path: '/image/text-to-image', component: TextToImagePage },
    //   { path: '/ai-chat', component: AiChatPage },
    { path: '/llm/:id', component: AiChatPage },
    { path: '/ai-chat-models', component: AiChatModelsPage },
    { path: '/license', component: LicenseListPage },
    { path: '/license/:packageName', component: LicensePage },
    { path: '/info', component: InfoPage },
    { path: '/new-user', component: NewUserPage },
]

export const router = createRouter({
    history: createMemoryHistory(),
    routes: routes as any,
})