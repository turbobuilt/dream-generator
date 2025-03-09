// typescript

/*
Step-by-step plan for the function implementation:
1. Import necessary modules and classes.
2. Create the function submitImageGenerateWithPrompt accepting req, res as parameters.
3. Inside function, get { prompt, style } from req.body.
4. Check the length of prompt, send error message and stop execution if length is less than 20.
5. Create an ImageGenerationRequest object with {steps, prompt} as parameters and save it.
6. Post a request to 'https://api.monsterapi.ai/prod/apis/add-task' with axios, headers and post data.
7. Extract the process_id from the response and start a polling interval.
8. In the interval, send a post request to 'https://api.monsterapi.ai/apis/task-status' with axios.
9. If status in response is not "IN_PROGRESS" or "COMPLETED", stop polling and throw an error.
10. Once status is "COMPLETED", stop polling, update and save ImageGenerationRequest, return output URL.
*/

// 47, 52, 62


// let styles = {
//     "Photorealistic": "Lifelike, ultra-realistic, high resolution, detailed, precise, true-to-life, vividly colorful, meticulous, authentic, intricate, hyper-realism, high-fidelity, accurate representation, impeccably rendered, sharp, sophisticated, state-of-the-art, seamless, advanced, professional-grade.",
//     "Anime": 
// }

let styleExtras = {
    'enhance': "amplified-vibrancy, intensified-contrast, refined-detail, magnified-clarity, boosted-saturation, elevated-sharpness, enriched-colors, elevated-brightness, fortifying-textures, defined-edges",
    'anime': "spirited-characters, exaggerated-expressions, vibrant-imagery, fantastical-scenes, high-energy-action, dynamic-angles, melodramatic-narratives, cherry-blossom-backdrops, stylized-aesthetics, dreamlike-sequences",
    'photographic': "retro-tinted, dramatic-shadows, sweeping-landscapes, candid-portraits, diverse-textures, kaleidoscopic-colors, geometric-compositions, chiaroscuro-lighting, richly-detailed, fleeting-moments",
    'digital-art': "sleek-designs, intricate-vectors, ethereal-hues, surreal-landscapes, dreamy-portraits, luminescent-colors, glitched-distortions, cyberpunk-NODE_ENVs, vivid-fantasies, otherworldly-creatures",
    'comic-book': "dynamic-action, bold-outlines, vibrant-hues, speech-bubble-narratives, exaggerated-proportions, panel-sequences, heroic-figures, dramatic-expressions, heavy-shading, gritty-backdrops",
    'fantasy-art': "mythical-creatures, enchanted-forests, celestial-bodies, glowing-auras, ancient-castles, magical-weapons, elven-characters, dreamlike-scenery, extravagant-costuming, mesmerizing-magic",
    'analog-film': "grainy-texture, nostalgic-aura, timeless-scenes, faded-colors, soft-focus, sepia-tones, light-leaks, vintage-vibes, weathered-captures, candid-moments",
    'neonpunk': "electric-hues, futuristic-cityscapes, vibrant-graffiti, glowing-lights, cybernetic-beings, artificial-intelligence, dystopian-scenery, holographic-displays, digital-dystopia, techno-noir",
    'isometric': "geometric-forms, 3d-landscapes, top-down-view, pixel-artistry, blocky-textures, virtual-mazes, cubic-characters, digital-architecture, gridlocked-worlds,  minimalist-design",
    'lowpoly': "abstract-shapes, triangulated-forms, polygonal-landscapes, geometric-animals, deconstructed-imagery, simplified-details, minimalist-aesthetic, blocky-textures, cubist-inspiration, flat-shadows",
    'origami': "folded-figures, paper-cranes, geometric-compositions, crafted-blossoms, concertina-designs, paper-sculptures, folded-fantasies, kinetic-creations, 3d-paper-art, intricate-patterns",
    'line-art': "minimalist-sketches, open-contours, intricate-patterns, one-line-drawings, continuous-sketch, monochrome-design, abstract-representations, geometric-creations, conceptual-imagery, freehand-techniques",
    'craft-clay': "3d-figures, playful-creations, childlike-characters, cartoonish-elements, vibrant-colorations, soft-sculptures, clay-morphing, textured-art, clay-animation, tactile-artform",
    'cinematic': "dramatic-lighting, panoramic-view, vintage-tones, film-grain, breathtaking-landscapes, epic-battle-scenes, action-packed, movie-still, noir-shadows, picturesque-imagery",
    '3d-model': "hyper-realism, digital-sculpting, lifelike-proportions, virtual-creations, realistic-textures, immersive-NODE_ENVs, complex-geometries, rendered-animations, photorealistic-lighting, computer-generated-artistry",
    'pixel-art': "8-bit, retro-gaming, mosaic-patterns, simplistic-designs, chunky-characters, classic-video-game, detailed-miniature, digitized-artwork, pixelated-scenes, bitmapped-art",
    'texture': "tactile-surface, rough-or-smooth, weathered-finish, stone-like, fabric-imprints, grainy-sands, cracked-weathered, metallic-shine, sensory-contrast, layered-textures",
    'futuristic': "high-tech, advanced-technology, alien-worlds, sci-fi-settings, neon-cityscapes, dystopian-futures, metallic-surface, hyper-modern, ai-characters, holographic-elements",
    'realism': "lifelike-detail, natural-light, true-to-life colors, visceral-scenes, photo-accuracy, replicating-reality, meticulous-detail, faithful-renditions, objective-representation, hyper-real textures",
    'watercolor': "fluid-brushstrokes, lightweight-medium, soft-washes, vibrant-pigments, layered-transparencies, light-infused-scenes, wet-on-wet, diffused-colors, airy-scenes, bleeding-techniques",
    'photorealistic': "high-definition, striking-detail, vivid-clarity, impeccable-realism, ultra-sharp, hyper-detailed, true-to-life portrayal, crisp-precision, pixel-perfect, breathtaking-accuracy."
}


import axios from 'axios';
import { ImageGenerationRequest } from '../models/ImageGenerationRequest';
import { generateImageReplicate } from './generateImageReplicate';
import { randomUUID } from 'crypto';
import { verifyAndroidPayment } from './verifyAndroidPayment';
import { generateImage } from './generateImage';
import { generateImageRunpod } from './runpodGenerateImage';
import { AuthenticatedUser } from '../models/AuthenticatedUser';


export interface GenerateImageParams {
    prompt: string;
    style: string;
    image: any;
    authenticatedUser: AuthenticatedUser
    similarity?: number;
    promptId?: number;
    quantity?: number;
    model?: string
    newAndroid?: boolean
}


export async function submitImageGenerateWithPrompt(req, res) {
    console.log("body is", req.body)
    let quantity = req.body.quantity || 1;
    if (typeof quantity != "number" || quantity < 1 || quantity > 10) {
        return res.status(400).json({ error: "Quantity must be a number between 1 and 10" });
    }
    let result = await generateImage({ authenticatedUser: req.authenticatedUser, ...req.body, quantity }, req);
    console.log("result is", result);
    return res.json(result);

    // let fancyPrompt = prompt;
    // try {
    //     fancyPrompt = await getGptPrompt(prompt);
    // } catch(err) {
    //     console.error(err);
    // }
    // console.log(fancyPrompt)

    // Post a request to external API
    // const results = await axios.post('https://api.monsterapi.ai/apis/add-task', {
    //     "model": "sdxl-base",
    //     "data": {
    //         "prompt": prompt,
    //         "negprompt": "child porn, underage nudity, child without clothes",     
    //         "samples": 1,
    //         "steps": 50,
    //         "aspect_ratio": "square",
    //         "guidance_scale": 12.5,
    //     }
    // },{
    //     headers:{
    //         'x-api-key': process.env.monster_api_key,
    //         'Authorization': `Bearer ${process.env.monster_token}`, 
    //         'Content-Type': 'application/json',
    //     }
    // })
    // const process_id = results.data.process_id;

    // let formData = new FormData();
    // formData.append("prompt", fancyPrompt);
    // formData.append("negprompt", "child porn, underage nudity, child without clothes");
    // formData.append("samples", 1..toString());
    // formData.append("steps", 50..toString());
    // formData.append("aspect_ratio", "square");
    // formData.append("guidance_scale", "12.5");
    // if(style && style.trim().toLowerCase() != "none") {
    //     formData.append("style", style.toLowerCase().replace(/ /g, "-"));
    // }

    // const results = await axios.post('https://api.monsterapi.ai/v1/generate/sdxl-base', formData, {
    //     headers: {
    //         "Authorization": `Bearer ${process.env.new_monster_token}`,
    //         "Accept": "application/json",
    //     }
    // })
    // const process_id = results.data.process_id;

    // // const process_id = '0f795149-374f-11ee-baad-ef7df057c3e1'
    // imgGenRequest.taskId = process_id;
    // imgGenRequest.status = "processing"
    // imgGenRequest.save();

    // return res.json({ taskId: process_id })
}


async function getGptPrompt(prompt) {
    // Post a request to external API
    let response = null;
    try {
        let formData = new FormData();
        formData.append("prompt", `Rewrite the following into a simple description: '${prompt}' in the style 'Photorealistic'.  The description should be smart, funny, astoundingly beautiful, and fit into three sentences. Describe what you want to see as if looking at an image of it with insane detail.  Describe your feelings it evokes, the time of day you imagine, and the colors that you see.  Be cheerful and make something beautiful of the description.  Make sure you return ONLY THE DESCRIPTION YOU COME UP WITH. All other informaiton will be discarded.  No explanations, just description.`);

        response = await axios.post('https://api.monsterapi.ai/v1/generate/falcon-7b-instruct', formData, {
            headers: {
                // 'x-api-key': process.env.monster_api_key,
                'Authorization': `Bearer ${process.env.new_monster_token}`,
                'Accept': 'application/json',
            },
        })
        console.log("response is", response.data)
    } catch (err) {
        console.error("Error adding task")
        console.error(err.response.data)
        return;
    }

    let statusUrl = response.data.status_url;
    // Start polling for task status
    let tries = 0;
    return new Promise((resolve, reject) => {
        const intervalId = setInterval(async () => {
            try {
                const statusCheckResult = await axios.get(statusUrl, {
                    headers: {
                        'Authorization': `Bearer ${process.env.new_monster_token}`,
                    }
                })
                console.log(statusCheckResult.data, ++tries)
                let status = statusCheckResult.data.status
                if (status !== "IN_PROGRESS" && status !== "COMPLETED" && status !== "IN_QUEUE") {
                    clearInterval(intervalId);
                    reject("Unexpected status from the server.")
                }
                if (status === "COMPLETED") {
                    clearInterval(intervalId)
                    resolve(statusCheckResult.data.result.text);
                    console.log(statusCheckResult.data)
                }
                if (tries > 8) {
                    clearInterval(intervalId);
                    reject("Took too long to generate prompt")
                }
            } catch (error) {
                if (error?.response?.data)
                    console.error(error.response.data)
                else
                    console.error(error)
                clearInterval(intervalId);
                reject(error);
            }
        }, 1000);
    })
}

export const route = { url: '/api/submit-image-generate-with-prompt', method: 'POST', authenticated: true };