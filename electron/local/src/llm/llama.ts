import { ipcMain } from "electron";
import { llamacpp, streamText } from "modelfusion";

export async function submitPromptPreload(data) {
    let { messages, modelId } = data;
    console.log("submitting prompt")
    let result = await streamText({
        model: llamacpp.CompletionTextGenerator({
            promptTemplate: llamacpp.prompt.Llama2, // Choose the prompt template from the model card
            maxGenerationTokens: 8192,
            temperature: 0.7,
        }).withChatPrompt(),
        prompt: {
            system: "",
            messages
        }
    });
    console.log("got result", result)
    return result;
}

ipcMain.addListener('submitChatPrompt', async function (event, data) {
    const [port] = event.ports;
    console.log("port is", port)
    try {
        let textStream = await submitPromptPreload(data);
        for await (const textPart of textStream) {
            console.log(textStream);
            event.sender.send('chat_message', textPart);
            port.postMessage({ event: 'chat_message', data: textPart });
        }
        event.sender.send('chat_message_complete')
        port.postMessage({ event: 'chat_message_complete' });
    } catch (err) {
        event.sender.send('chat_message_complete');
        port.postMessage({ event: 'chat_message_complete' });
        event.sender.send('chat_message_error', err.stack)
        port.postMessage({ event: 'chat_message_error', data: err.stack });
        console.error(err);
    }
});