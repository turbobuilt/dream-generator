// Step 1: Import DbObject from global scope
// Step 2: Define MainFeed class that extends DbObject
// Step 3: Define instance variables: id, prompt, and position
// Step 4: Position parameter is of number type
// Step 5: Do not define constructor because it will inherit from DbObject

export class MainFeed extends global.DbObject {
    id: number; // The ID of the main feed item
    prompt: string; // The prompt for the main feed item
    position: number; // The position of the main feed item in the feed
}