import { DbObject } from "./db";

export class ImageGenerationRequest extends DbObject {
    id?: number;
    prompt?: string;
    outputUrl?: string;
    numSteps?: number;
    negativePrompt?: string;
    aspectRatio?: string;
    status?: string;
    taskId?: string;
    provider?: string;
    error?: string;
    nsfw?: boolean;
    model?: string;
    charged?: boolean;
    isFree?: boolean;
    authenticatedUser?: any;
}
