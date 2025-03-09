import { CreateImageRequestSettings } from "@/serverModels/CreateImageRequestSettings";
import Create from "./Create.vue"
import { serverMethods } from "@/serverMethods";
import { showHttpErrorIfExists } from "@/lib/handleHttpError";
import { store } from "@/store";
import downloadFileToArrayBuffer from "@/lib/downloadFileToArrayBuffer";
import { SavedImageData, saveImage } from "@/lib/imageSave";
import { c } from "vite/dist/node/types.d-aGj9QkWt";

export interface ImagePromptInProgress {
    isEdit?: boolean
    items: ImageInProgress[]
    complete: boolean;
    startTime: number;
    error?: string;
}
export interface ImageInProgress {
    taskId
    statusMessage?: string
    startTime: number
    complete: boolean,
    error?: string
    downloading?: boolean,
    downloadingPercent?: number
    outputUrl?: string
    arrayBuffer?: ArrayBuffer
    extension?: string;
    settings: CreateImageRequestSettings
    prompt?: string;
    style?: string;
    model: string;
}

export async function createImage(component: typeof Create) {
    // if (window.location.href.indexOf("localhost") > -1) {
    //     // 
    //     // localStorage.setItem("imagesInProgress", JSON.stringify(store.imagesInProgress));
    //     store.imagesInProgress = JSON.parse(localStorage.getItem("imagesInProgress") || "[]");
    //     store.imagesInProgress[0].items.push(JSON.parse(JSON.stringify(store.imagesInProgress[0].items[0])))
    //     store.imagesInProgress[0].items[1].downloading = true;
    //     store.imagesInProgress[0].items[1].downloadingPercent = 50;
    //     store.imagesInProgress[0].items[1].complete = false;
    //     console.log("imagesInProgress", store.imagesInProgress);
    //     return;
    // }

    component.makingImage = true;
    let settings = store.imageRequestSettings as CreateImageRequestSettings;
    console.log("Settings", settings);
    let result = await serverMethods.submitImageGenerateWithPrompt(settings as any);
    console.log("ultimate result", result)
    // if (result.code === "free_limit_reached") {
    //     console.log("free limit reached");
    //     store.showingFreeLimitReachedModal = true;
    //     component.makingImage = false;
    //     return;
    // }

    if (result.code == "insufficient_credits" || result.code === "free_limit_reached") {
        store.showingUpgradeModal = true;
        component.makingImage = false;
        return result;
    }
    if (showHttpErrorIfExists(result, "Creating image")) {
        console.error("error making image", result)
        component.makingImage = false;
        return result;
    }
    let taskIds = result.taskIds;
    let items: ImageInProgress[] = [];
    for (let taskId of taskIds) {
        items.push({
            taskId,
            startTime: new Date().getTime(),
            complete: false,
            error: "",
            downloading: false,
            downloadingPercent: null,
            arrayBuffer: null,
            settings,
            prompt: settings.prompt,
            style: settings.style,
            model: settings.model
        })
    }
    store.imageGenerationRequests.push({
        items,
        complete: false,
        startTime: new Date().getTime()
    })
    startPollImageStatusTimer();
    component.makingImage = false;
}

interface ImageGenerationRequestStatus { creditsRemaining?: number, error?: null, model: "sdxl", outputUrl?: string, status: "COMPLETED" | any, taskId: string }

export interface ImageGenerationRequest {
    prompt?: string,
    style?: string,
    taskIds: any[],
    complete: boolean,
    error: string,
    pollAttempts: number,
    startTime: number,
    results: { [taskId: string]: ImageGenerationResult }
}
export interface ImageGenerationResult {
    file?: any,
    error?: string
}


export async function startPollImageStatusTimer() {
    try {
        if (!store.pollImageStatusTimer) {
            return; // on first time, don't run check, just start timer.
        }
        console.log("starting timer")
        if (store.pollImageStatusTimer) {
            clearTimeout(store.pollImageStatusTimer);
        }
        try {
            store.imagePollingError = "";
            let pendingTaskIds = [], completeTaskIds = [];
            for (let item of store.imageGenerationRequests) {
                for (let task of item.items) {
                    if (task.complete) {
                        completeTaskIds.push(task.taskId);
                    } else {
                        pendingTaskIds.push(task.taskId);
                    }
                }
            }
            if (pendingTaskIds.length === 0) {
                return;
            }
            let result = await serverMethods.pollImageStatusMany({ taskIds: pendingTaskIds, client: "web" });
            if (result.error) {
                console.log("error polling image status", result.error);
                store.imagePollingError = result.error;
                return;
            }
            let statuses = result.statuses as ImageGenerationRequestStatus[];
            let statusIndex = 0;
            for (let item of store.imageGenerationRequests) {
                for (let task of item.items) {
                    if (task.complete) {
                        continue;
                    }
                    let status = statuses[statusIndex++];
                    if (status) {
                        task.complete = status.outputUrl?.length > 0 || status.error;
                        task.statusMessage = status.status;
                        task.error = status.error;
                        task.outputUrl = status.outputUrl;
                        if (task.outputUrl) {
                            store.authenticatedUser.creditsRemaining = status.creditsRemaining;
                            console.log("credit sremaining image", status.creditsRemaining);
                            console.log("downloading image");
                            task.downloading = true;
                            task.downloadingPercent = 0.1;
                            try {
                                let result = await downloadFile(status, task.settings, (percent) => {
                                    task.downloadingPercent = percent;
                                });
                                task.arrayBuffer = result.arrayBuffer;
                                task.extension = result.extension
                            } catch (err) {
                                task.error = "Error download: " + err.message;
                            } finally {
                                task.downloading = false;
                                task.downloadingPercent = null;
                            }
                            if (task.complete) {
                                item.complete = true;
                            }
                        }
                    }
                }
            }
            // check if all done
            for (let item of store.imageGenerationRequests) {
                let allDone = true;
                for (let task of item.items) {
                    if (!task.complete) {
                        allDone = false;
                        break;
                    }
                }
                item.complete = allDone;
            }
            localStorage.setItem("imagesInProgress", JSON.stringify(store.imageGenerationRequests));
        } catch (err) {
            console.error("Error polling image status", err);
        }
    } catch (err) {
        console.error(err);
    } finally {
        let allDone = false;
        for (let item of store.imageGenerationRequests) {
            for (let task of item.items) {
                if (!task.complete) {
                    allDone = false;
                    break;
                }
            }
        }
        if (allDone) {
            store.pollImageStatusTimer = null;
        } else {
            store.pollImageStatusTimer = setTimeout(() => startPollImageStatusTimer(), 2000);
        }
    }
}

export async function downloadFile(status: ImageGenerationRequestStatus, imageRequestSettings: CreateImageRequestSettings, onProgress: (percent: number) => void) {
    try {
        let result = await downloadFileToArrayBuffer(status.outputUrl, onProgress);
        let imageData = {
            id: Date.now(),
            model: status.model,
            arrayBuffer: result.arrayBuffer,
            extension: result.extension,
            published: false,
            sharedImage: null,
            prompt: imageRequestSettings.prompt,
            date: new Date(),
            taskId: status.taskId,
            style: imageRequestSettings.style,
            isRemoveBackground: imageRequestSettings.isRemoveBackground
        } as SavedImageData;
        await saveImage(imageData);
        store.images.unshift({
            ...imageData,
            url: URL.createObjectURL(new Blob([result.arrayBuffer]))
        });
        return result;
    } catch (err) {
        console.error(err);
        this.createImageError = err.message;
    } finally {

    }
}