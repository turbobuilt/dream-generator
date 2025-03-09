import { appendMessage } from "./postAiChat";

const { VertexAI } = require('@google-cloud/vertexai');
const fs = require("fs");

// Initialize Vertex with your Cloud project and location
const vertex_ai = new VertexAI({ project: 'dreamgenerator-1691405135213', location: 'us-central1' });
const model = 'gemini-1.5-flash-002';


export async function generateGoogleChat(messages, res) {
    // Instantiate the models
    const generativeModel = vertex_ai.preview.getGenerativeModel({
        model: model,
        generationConfig: {
            'maxOutputTokens': 8192,
            'temperature': 1,
            'topP': 0.95,
        },
        safetySettings: [
            {
                'category': 'HARM_CATEGORY_HATE_SPEECH',
                'threshold': 'OFF',
            },
            {
                'category': 'HARM_CATEGORY_DANGEROUS_CONTENT',
                'threshold': 'OFF',
            },
            {
                'category': 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                'threshold': 'OFF',
            },
            {
                'category': 'HARM_CATEGORY_HARASSMENT',
                'threshold': 'OFF',
            }
        ],
    });
    const text1 = {
        text: `You are a bot that carefully and thoroughly extracts tabular data from the given image into the following format:

{
  [make]: {
    [model]: [
      { year: string, engine: string, footNote: string, group: string , cca: number, ampHrs: string, tech: string },
      { year: string, engine: string, footNote: string, group: string , cca: number, ampHrs: string, tech: string }

You ensure each row of data is on one line in the output, formatting wise.

You print the complete JSON, extracting every line from the table in the picture. You make sure to ensure that every row is nested under the correct make which is nested under the correct model.

You notice that the make has a black background, and the model has a grey background.

You are careful not to miss a single line. Once you print out the headings, you faithfully fill out the json until every line in the image is complete.`};
    const image1 = {
        inlineData: {
            mimeType: 'image/png',
            data: fs.readFileSync("splits/" + imageName).toString("base64")
        }
    };

    const req = {
        contents: [
            { role: 'user', parts: [text1, image1, { text: `extract all rows.` }] }
        ],
    };

    const streamingResp = await generativeModel.generateContentStream(req);

    for await (const item of streamingResp.stream) {
        appendMessage(item.choices[0]?.delta?.content, res);
        // process.stdout.write('stream chunk: ' + JSON.stringify(item) + '\n');
    }
    let all = await streamingResp.response;
    
}
