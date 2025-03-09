import { randomUUID } from "crypto";
import { AuthenticatedUser } from "../models/AuthenticatedUser";
import { ImageGenerationRequest } from "../models/ImageGenerationRequest";
import { generateImageReplicate } from "./generateImageReplicate";
import { modifyImageReplicate } from "./modifyImageReplicate";
import { verifyAndroidPayment } from "./verifyAndroidPayment";
import { generateImageRunpod } from "./runpodGenerateImage";
import { gptPrompt } from "./gptPrompt";
import { generateImageRunpodSmall } from "./runpodGenerateImageSmall";
import { dalleGenerateImage } from "./dalleGenerateImage";
import moment from "moment";
import { generateImageModal } from "./generateImageModal";
import { generateSdxlModal } from "./generateSdxlModal";
import { GenerateImageParams } from "./submitImageGenerateWithPrompt";
import { generateDreamshaperV8Modal } from "./generateDreamshaperV8Modal";
// import { generateSdxlLightningOctoAi } from "./generateSdxlLightningOctoAi";
// import { generateSd3OctoAI } from "./generateSd3OctoAI";
import { generateImageFluxSchnell } from "./generateImageFluxSchnell";

interface GenerateImageResponse {
    taskId?: string;
    error?: string;
    code?: string;
    creditsRemaining?: number;
}

export var imageModels = {
    // "sdxl-lightning": {
    //     censored: true,
    //     label: "Low (Fast)",
    //     creditCost: .5,
    //     generator: generateSdxlLightningOctoAi
    // },
    "sdxl": {
        censored: true,
        default: true,
        label: "Normal",
        creditCost: .7,
        generator: generateImageRunpod
        // generator: generateSdxlModal
    },
    "sd-openjourney": {
        censored: true,
        label: "Very Low Quality",
        creditCost: .2,
        generator: generateImageRunpodSmall
    },
    "dreamshaper-v8": {
        censored: false,
        label: "Low Quality",
        creditCost: .2,
        generator: generateDreamshaperV8Modal
    },
    "flux-schnell": {
        censored: true,
        label: "Higher Quality",
        creditCost: .8,
        generator: generateImageFluxSchnell
    },
    // "sd-3": {
    //     censored: true,
    //     label: "High Quality", 
    //     creditCost: 6,
    //     generator: generateSd3OctoAI
    // },
    "dalle3": {
        censored: true,
        label: "Very High Quality",
        creditCost: 8,
        generator: dalleGenerateImage
    },
}
export var currentImageModels = {
    // "sdxl-lightning": imageModels["sdxl-lightning"],
    "sdxl": imageModels["sdxl"],
    "flux-schnell": imageModels["flux-schnell"],
    // "sd-3": imageModels["sd-3"],
    "dalle3": imageModels["dalle3"],
}

export type GenerateImageError = "free_limit_reached" | "insufficient_credits" | "nsfw"

export async function generateImage(params: GenerateImageParams, req): Promise<{ error?: string, code?: GenerateImageError, creditsRemaining?: number, freeCreditsRoundTwo?: boolean, freeCreditsRoundThree?: boolean, taskIds?: string[], taskId?: string }> {
    // Destructure the request body
    let { prompt, style, image, similarity, authenticatedUser, promptId, quantity, model, newAndroid } = params;

    // if (req.headers.isandroid == "true") {
    //     if (!authenticatedUser.plan && !authenticatedUser.appleIdentifier && !authenticatedUser.googleId) {
    //         return { error: "You must login with Google or Apple, or subscribe to a plan to prevent fraud.  We apologize for the inconvenience but want to make sure we can offer this app as cheaply as possible.", code: "not_verified" };
    //     }
    // }
    // console.log("quality is ", quality);

    model = model || "flux-schnell"
    var isAdSupported = useSmallImage(req);
    if (isAdSupported) {
        model = "flux-schnell";
    }
    if (model == "sd-openjourney" || model == "sdxl" || model == "sdxl-lightning") {
        // model = "dreamshaper-v8"
        model = "flux-schnell";
    }
    var modelInfo = imageModels[model];
    if (!modelInfo) {
        throw new Error("error - this quality setting is not working or has been disabled. please choose another.")
    }

    let creditCost = modelInfo.creditCost * quantity
    let originalPrompt = prompt;

    // Validate prompt length
    if (!prompt || prompt.length < 5) {
        return { error: "Prompt must be at least 20 characters long. If you think this is an error, please email support@dreamgenerator.ai" };
    }
    if (prompt.length > 700) {
        return { error: "Prompt can't be greater than 700 characters.  Sorry!" };
    }

    if (style && style.trim().toLowerCase() != "none") {
        prompt = `${prompt}, ${style}`;
    }

    // first check if they have enough credits
    if (authenticatedUser.creditsRemaining < creditCost) {
        // first make sure no unregistered payments
        try {
            let [[payment]] = await global.db.query(`SELECT * FROM Payment WHERE authenticatedUser = ? AND androidToken IS NOT NULL ORDER BY id DESC LIMIT 1`, [authenticatedUser.id]);
            if (payment) {
                console.log("payment found", payment)
                let data = await verifyAndroidPayment(payment.androidToken, payment.productId, authenticatedUser.id);
                console.log(data);
                if (data && data.creditsRemaining > 0) {
                    authenticatedUser.creditsRemaining = data.creditsRemaining;
                }
            }
        } catch (err) {
            console.error(err);
        }
        if (isAdSupported) {
            let maxFreeImagesPerDay = req.headers.isios == "true" ? 20 : 20;

            // get number of images they've done in last 24 hours and limit to 3
            let oneDayAgo = moment().subtract(1, 'day').toDate().getTime();
            let [[countInfo]] = await global.db.query(`SELECT COUNT(*) as num_images FROM ImageGenerationRequest WHERE created > ? AND authenticatedUser = ? AND isFree=1`, [oneDayAgo, authenticatedUser.id]);
            if (countInfo.num_images >= maxFreeImagesPerDay && authenticatedUser.creditsRemaining < .2) {
                return { error: `You have reached the limit of ${maxFreeImagesPerDay} images per day on the free plan.  Please subscribe to a paid plan to continue using the app.`, code: "free_limit_reached", creditsRemaining: authenticatedUser.creditsRemaining };
            }
        } else {
            let [[authenticatedUserInfo]] = await global.db.query(`SELECT * FROM AuthenticatedUser WHERE id = ?`, [authenticatedUser.id]);
            return { error: "You don't have enough credits!", code: "insufficient_credits", creditsRemaining: authenticatedUser.creditsRemaining, freeCreditsRoundTwo: !!authenticatedUserInfo.freeCreditsRoundTwo, freeCreditsRoundThree: !!authenticatedUserInfo.freeCreditsRoundThree };
        }
    }

    // if localhost, do sdxl
    if (req.headers.host.includes("localhost") || req.headers.host.match(/\d+\.\d+\.\d+\.\d+/)) {
        model = "flux-schnell";
    }

    if (req.headers.isios == "true") {
        var { error, result } = await gptPrompt(`return a json object like this: {"childPornProbability": [0-100], "graphicSexAct": [0-100] }. A graphic sex act includes any of these: 1) penis in vagina, 2) penis in mouth, 3) anything that is an actual act of sex, 4) anything homosexual between men.  Nudity is NOT graphic sexual content, and should return 0 probability. Sexual content means they are having sex AND are naked. But this is a prompt description so if it says they are having sex, it is sexual content. Masturbation/anything by oneself is NOT graphic sexual content because it's alone. prompt: "${originalPrompt}"`, {
            max_tokens: 100,
            response_format: { type: "json_object" }
        });
    } else if (req.headers.isandroid == "true") {
        // moderate this image prompt. return json to detect sexual content. sexual content is defined as "anything that stimulates sexual desire".
        if (newAndroid) {
            var { error, result } = await gptPrompt(prompt, {
                systemMessage: `moderate this image prompt. return only a json object of format { sexual_content: number } to detect sexual content. sexual content is defined as "anything that stimulates sexual desire"`,
                response_format: { type: "json_object" }
            })
            console.log("result is", result);
        } else {
            var { error, result } = await gptPrompt(prompt, {
                systemMessage: `You are a moderator robot to detect nsfw prompts. Be generous, allow things like beautiful and sexy images, but not full on nudity unless it's artistic. You return only json string indicating the probability a prompt contains nsfw content or nudity like this: { "nsfw": [0-100] }`,
                response_format: { type: "json_object" }
            })
        }
    } else {
        // check for illegal content only
        var { error, result } = await gptPrompt(prompt, {
            systemMessage: `You are a moderator robot to detect illegal images. Return json like this: { "childPorn": [0-100] } `,
            response_format: { type: "json_object" }
        });
    }
    if (error) {
        return { error }
    }
    try {
        let json = JSON.parse(result);
        if (req.headers.isandroid === "true" && (typeof json === "string" || (req.headers.nswf === undefined && req.headers.sexual_content === undefined))) {
            return { error: "Error moderating your prompt. please contact support@dreamgenerator.ai and say 'the nsfw checker is returning plain string!' Then we will know how to fix it." };
        }
        console.log("json is", json);
        if (json.childPorn > 70) {
            return { error: "Your prompt was flagged as inappropriate.  Please try again with a different prompt." };
        }
        if (json.graphicSexAct > 70 && req.headers.isios == "true") {
            return { error: "Your prompt was flagged as violating App Store guidelines.  Please try again with a different prompt, or try on a different platform. This may be frustrating, but nudity is allowed, you just can't do graphic sex acts and nudity. It's a fine line, but it's a judgement call.  Try changing the prompt a bit and you should be good. In general, you can't show people having sex in a graphic way on the app store." };
        }
        if (json.nsfw > 70 || json.sexual_content) {
            return { error: "Google Play policies forbid apps that show nudity or sexual content. Please visit dreamgenerator.ai to generate this prompt." };
            
            return { error: "Your prompt was flagged as violating Google Play guidelines. It might not be NSFW. Only \"artistic\" nudity is allowed.  Please go to dreamgenerator.ai to generate this prompt or try an \"artistic\" prompt." };
            // return { error: "Your prompt was flagged as violating Google Play guidelines. It might not be NSFW. Only \"artistic\" nudity is allowed.  Please go to dreamgenerator.ai to generate this prompt or try an \"artistic\" prompt." };
            // return { error: "Your prompt was flagged as violating Google Play guidelines. It might not be NSFW. Only \"artistic\" nudity is allowed.  Please go to dreamgenerator.ai to generate this prompt or try an \"artistic\" prompt.", code: "nsfw" };
        }
    } catch (err) {
        return { error: "Error moderating your prompt.  Please try again with a different prompt! Sometimes the AI engine can't figure out what to do and if you change the prompt a bit it should be fine." };
    }
    let probability = parseFloat(result);
    if (probability > 7) {
        return { error: "Your prompt was flagged as inappropriate.  Please try again with a different prompt." };
    }

    promptId = parseInt(promptId as any);
    if (Number.isNaN(promptId)) {
        promptId = 0;
    }

    // Create an ImageGenerationRequest and save it
    let isFree = authenticatedUser.creditsRemaining < creditCost ? 1 : 0;
    let data = {
        steps: 50,
        taskId: randomUUID(),
        status: "CREATED",
        authenticatedUser: authenticatedUser.id,
        isFree,
        model
    };
    // if(promptId > 0)
    //     data.prompt = promptId;
    let imgGenRequest = new ImageGenerationRequest(data);
    await imgGenRequest.save();
    console.log(prompt);


    imgGenRequest.status = "PROCESSING";
    await imgGenRequest.save();

    // count image generation request that were nsfw in the past month.  if it's a free account, ban them
    let [[countInfo]] = await global.db.query(`SELECT COUNT(*) as num_nsfw FROM ImageGenerationRequest WHERE nsfw = 1 AND created > DATE_SUB(NOW(), INTERVAL 1 MONTH) AND authenticatedUser = ?`, [authenticatedUser.id]);
    let [[userInfo]] = await global.db.query(`SELECT * FROM AuthenticatedUser WHERE id = ?`, [authenticatedUser.id]);
    if (countInfo.num_nsfw > 15 && !userInfo.plan) {
        return { error: "Your account is associated with a number of requests that take time on the server but can't get shown because they have too much innapropriate content according to certain people.  We don't agree with the standards, but we have to pay for each request. Soon this will not be an issue.  Please try our web based platform if you would like unfiltered content." };
    }
    console.log(req.headers);
    let imgGenRequests = [imgGenRequest]
    let promises = []
    for (let i = 1; i < quantity; i++) {
        let imgGenRequest = new ImageGenerationRequest();
        Object.assign(imgGenRequest, data);
        delete imgGenRequest.id;
        imgGenRequest.taskId = randomUUID();
        promises.push(imgGenRequest.save());
        imgGenRequests.push(imgGenRequest);
    }
    await Promise.all(promises);

    promises = [];
    for (let imgGenRequest of imgGenRequests) {
        if (image) {
            promises.push(modifyImageReplicate(prompt, imgGenRequest, image, similarity));
        } else {
            if (model == "sd-openjourney") {
                // // promises.push(dalleGenerateImage(prompt, imgGenRequest));
                // if (useSmallImage(req)) {
                promises.push(generateDreamshaperV8Modal(prompt, imgGenRequest));
                // promises.push(generateImageRunpodSmall(prompt, imgGenRequest));
            } else if (model === "flux-schnell") {
                promises.push(generateImageFluxSchnell(prompt, imgGenRequest));
            } 
            // else if (model == "dreamshaper-v8" || model == "sdxl-lightning") {
            //     promises.push(generateSdxlLightningOctoAi(prompt, imgGenRequest));
            //     // if (req.headers.host.includes("localhost") || req.headers.host.match(/\d+\.\d+\.\d+\.\d+/)) {
            //     //     promises.push(generateSdxlLightningOctoAi(prompt, imgGenRequest));
            //     // } else {
            //     //     promises.push(generateDreamshaperV8Modal(prompt, imgGenRequest));
            //     // }
            // } else if (model == "sd-3") {
            //     promises.push(generateSd3OctoAI(prompt, imgGenRequest));
            // } 
            else if (model == "sdxl") {
                // if localhost or an ip address, use test model
                promises.push(generateSdxlModal(prompt, imgGenRequest));
                // if (req.headers.host.includes("localhost") || req.headers.host.match(/\d+\.\d+\.\d+\.\d+/)) {
                // } else {
                //     promises.push(generateImageRunpod(prompt, imgGenRequest));
                // }
                // promises.push(imageModels[model].generator(prompt, imgGenRequest));
                // 
            } else if (model == "dalle3") {
                promises.push(dalleGenerateImage(prompt, imgGenRequest));
            } else {
                return { error: "Model not found" };
            }
        }
    }
    await Promise.all(promises);
    let taskIds = [];
    for (let imgGenRequest of imgGenRequests) {
        console.log("imgGenRequest", imgGenRequest.taskId);
        taskIds.push(imgGenRequest.taskId);
    }

    return { taskId: imgGenRequest.taskId, taskIds: taskIds };
}

function useSmallImage(req) {
    if (!req.headers.isandroid && !req.headers.isios) {
        return false;
    }
    // console.log("checking small", req && (req.headers.isandroid == "true" || req.headers.isios == "true") && !req.authenticatedUser.plan && req.authenticatedUser.creditsRemaining < 1)
    if (req && !req.authenticatedUser.plan && req.authenticatedUser.creditsRemaining < 1) {
        return true;
    }
    if (req.authenticatedUser.plan && req.authenticatedUser.creditsRemaining < 1) {
        return true;
    }
    return false;
}