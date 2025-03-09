// typescript

// Step-by-step plan:
// 1. Import the necessary modules OpenAI from 'openai'
// 2. Establish an OpenAI connection using the openai_api_key from the environment variables
// 3. Create an async function 'gptPrompt' with a single string parameter
// 4. Inside a try catch block, create an OpenAI chat completion using the input string as content
// 5. Upon success, return the first choice content
// 6. Upon failure, console.error the error and return an object containing the error message

import OpenAI from 'openai';

// establish openai connection
const openai = new OpenAI({
    apiKey: process.env.openai_api_key
});

export class GptPromptOptions {
    max_tokens? = 100;
    response_format? = undefined
    systemMessage?: string;
}

export async function gptPrompt(input: string, options = new GptPromptOptions()): Promise<{ error?: string, result?: string }> {
    try {
        let { max_tokens, systemMessage } = options;
        delete options.systemMessage;
        let extraMessages = systemMessage ? [{ role: 'system', content: systemMessage }] : [];
        // create openai chat completion
        const completion = await openai.chat.completions.create({
            messages: [
                ...extraMessages,
                { role: 'user', content: input }
            ],
            model: 'gpt-3.5-turbo-0125',
            temperature: .2,
            ...options
        });

        // return the first choice content
        const result = completion.choices[0]?.message.content.trim();
        return { result };
    } catch (error) {
        // log the error and return it
        console.error(error);
        return { error: error.message };
    }
}