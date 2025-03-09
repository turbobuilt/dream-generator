// Step-by-step plan:
// 1. Export the class called ImageGenerationRequest that extends the global DbObject class.
// 2. Define the fields for the new class: id, prompt, outputUrl, numSteps, negativePrompt, aspectRatio.
// 3. Since we're saying not to create a constructor, there will be no explicit constructor in the new class
//    as it would be inhertied from parent DbObject class.
// 4. Typings for the fields will be the ones provided in the prompt.

// Here is how the ImageGenerationRequest class would look like:

export class Review extends global.DbObject {
    id: number;
    authenticatedUser: number;
}