import { reactive } from "vue"
import { LlamaCpp } from "./pages/chat/models/LlamaCpp"
import { ModelData } from "./app/models/Model"

export const store = reactive({
    models: null,
    // preloadData: (window as any).preloadData,
    llamaCpp: new LlamaCpp(),
    backgroundNoiseRemovalState: reactive({
        file: null as File,
        convertingInputFile: false,
        removingNoise: false,
        percent: null,
        extractingAudioPercent: null,
        estimatedTimeRemaining: null,
        currentModelId: "noise-suppression-poconetlike-0001",
        modelData: null as ModelData,
        error: ""
    }),
    textToImageState: reactive({
        prompt: '',
        makingImage: false,
        imageData: null,
        preloadData: {} as any,
        modelLoading: false,
        modelLoaded: false,
        steps: 12,
        iterationTime: 0,
        serverLoadingPercent: 0,
        imageGenerationPercent: 0,
        loadingStatus: "",
        ramUsage: 0,
        currentModelId: "lcm_dreamshaper_7_fp16",
        modelData: null as ModelData
    }),
    chatModelState:  reactive({
        prompt: '',
        loading: false,
        messages: [],
        downloaded: false,
        downloadProgress: null,
        error: "",
        modelData: null as ModelData
    })
})