import { reactive } from "vue"

export const store = reactive({
    authenticatedUser: null as AuthenticatedUser,
    token: null as string,
    isTest: window.location.host === "dreamgenerator.ai" ? false : true,
    showLoginPage: false,
    currentImage: null as any,
    loadingOrDisplayingImage: false,
    baseImagePath: "https://images.dreamgenerator.ai/",
    currentPromptInfo: null as { prompt: string, style: string, model: string } | null,
    avifLoaded: false,
    avifLoading: false,
    wantsToBePatron: false,
    plans: null as any[],
    basePath: window.location.href.indexOf("localhost") > -1 ? "/app" : "",
    showingRegisterOrUpgradeModal: false,
})


export interface AuthenticatedUser {
    id: number
    email: string
    name: string
    provider: string
    providerData: string
    creditsRemaining: number
    created: number
    updated: number
    createdBy: number
    updatedBy: number
    
    agreesToTerms: boolean
    plan: string
    understandsPublishCommitment: boolean
    pushToken: string
    autoPublish: boolean
    userName: string
    shareEmail: string
    expandedContent: any;
}