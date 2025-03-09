import downloadFileToArrayBuffer from "@/lib/downloadFileToArrayBuffer";
import { saveImage } from "@/lib/imageSave";
import axios from "axios";

export interface ImageGenerationRequestStatus {
    outputUrl?: string,
    error?: string,
    taskId: string,
    model?: string,
    status: string,
    nsfw?: any
}

export interface ImageGenerationResult {
    file?: any,
    error?: string
}

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
export async function getImageGenerationRequestStatus(app) {
    let imageGenerationRequests = app.imageGenerationRequests as ImageGenerationRequest[];
    let allComplete = true;
    for (let imageGenerationRequest of imageGenerationRequests) {
        try {
            if (imageGenerationRequest.complete) {
                continue;
            }
            allComplete = false;
            let response = await axios.post(`/api/poll-image-status-many`, {
                client: "web",
                taskIds: imageGenerationRequest.taskIds
            })
            let statuses = response.data.statuses as ImageGenerationRequestStatus[];
            if (!imageGenerationRequest.results) {
                imageGenerationRequest.results = {}
            }
            let currentComplete = true;
            for (let status of statuses) {
                if (!status.taskId) {
                    currentComplete = false;
                    continue;
                } else if (!imageGenerationRequest.results[status.taskId]) {
                    imageGenerationRequest.results[status.taskId] = status;
                }
                // if there's an outputUrl, but data is null, then we need to download the file
                if (status.outputUrl) {
                    if (!imageGenerationRequest.results[status.taskId].file) {
                        imageGenerationRequest.results[status.taskId].file = downloadFile(status, imageGenerationRequest);
                    }
                    // imageGenerationRequest.results[status.taskId].file.then(() => imageGenerationRequest.results[status.taskId].
                } else if (status.error) {
                    imageGenerationRequest.results[status.taskId].error = status.error;
                } else if (Date.now() - imageGenerationRequest.startTime > 1000 * 60 * 5) {
                    imageGenerationRequest.error = "Timeout";
                } else {
                    currentComplete = false;
                }
            }
            imageGenerationRequest.complete = currentComplete;
        } catch (err) {
            console.error(err);
            imageGenerationRequest.error = err?.response?.data?.error || err?.response?.data || err?.message || err
        }
    }
    if (allComplete) {
        app.pollStatusTimeout = null;
    } else {
        app.pollStatusTimeout = setTimeout(() => {
            getImageGenerationRequestStatus(app);
        }, 1000);
    }
}

async function downloadFile(status: ImageGenerationRequestStatus, imageGenerationRequest: ImageGenerationRequest) {
    try {
        let result = await downloadFileToArrayBuffer(status.outputUrl);
        await saveImage({
            id: Date.now(),
            model: status.model,
            arrayBuffer: result.arrayBuffer,
            extension: result.extension,
            sharedImage: null,
            published: false,
            prompt: imageGenerationRequest.prompt,
            date: new Date(),
            taskId: status.taskId,
            style: imageGenerationRequest.style
        });
        return arrayBuffer;
    } catch (err) {
        console.error(err);
        this.createImageError = err.message;
    } finally {

    }
}