// Step-by-step plan:
// 1. JohnDoe must extend global.DbObject.
// 2. Annotate JohnDoe with "export" so it can be used in other modules.
// 3. Define required properties for JohnDoe: name.
// 4. Note that methods should not be reimplemented from global.DbObject unless needed.

import { DbObject } from "../lib/db";

export class PromptCategory extends DbObject {
    // Property "name" of type string
    name: string;
}