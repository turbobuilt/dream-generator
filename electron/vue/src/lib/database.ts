import { Database } from "../app/lib/database";
import { getDatabase } from "../app/preload-old-connector";

// export async function getDatabase(): Promise<typeof Database> {
//     let database = await getDatabase();
//     return database;
// }

export async function getTable(name): Promise<any> {
    let database = await getDatabase();
    return await database.table(name);
}