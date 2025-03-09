import { ipcMain } from "electron";
import { getUserDataPath } from "./paths";
import { join } from "path";
import { readFile, writeFile } from "fs/promises";
import { Model } from "../models/Model";


class DatabaseRawData {
    [table: string]: DatabaseRawTable;
}
class DatabaseRawTable {
    [id: string]: DatabaseRecord;
}
class DatabaseRecord {
    id: string;
    [key: string]: any;
}

export class Database {
    static rawData = {} as DatabaseRawData;
    static loaded = false;

    static async table(name: string) {
        if (!Database.loaded) {
            await Database.load();
            Database.loaded = true;
        }
        if (!Database.rawData[name]) {
            Database.rawData[name] = {};
        }
        return Database.rawData[name];
    }

    static async load() {
        let appDataPath = await getUserDataPath();
        console.log("App data path", appDataPath);
        let dbPath = join(appDataPath, 'database.json');
        console.log("Loading database from", dbPath);
        let data = {};
        try {
            let dataStr = await readFile(dbPath, 'utf8');
            data = JSON.parse(dataStr);
            console.log("Loaded database", data);
        } catch (err) {
            console.error("Error loading database", err);
         }
        Object.assign(Database.rawData, data);
        // delete any unperisted fields
        if (this.rawData.Model) {
            for (let id in this.rawData.Model) {
                for (let key in this.rawData.Model[id]) {
                    if (!Model.savedFields.includes(key)) {
                        delete this.rawData.Model[id][key];
                    }
                }
            }
        }
    }

    static async save() {
        let appDataPath = await getUserDataPath();
        let dbPath = join(appDataPath, 'database.json');
        let objectToSave = {};
        for (let tableName in Database.rawData) {
            objectToSave[tableName] = {};
            let sourceTable = Database.rawData[tableName];
            if (tableName === "Model") {
                for (let id in sourceTable) {
                    objectToSave[tableName][id] = { id: sourceTable[id].id };
                    for(let key in sourceTable[id]) {
                        if (Model.savedFields.includes(key) && sourceTable[id][key] !== undefined) {
                            objectToSave[tableName][id][key] = JSON.parse(JSON.stringify(sourceTable[id][key]));
                        }
                    }
                }
            } else {
                objectToSave[tableName] = JSON.parse(JSON.stringify(Database.rawData[tableName]));
            }
        }
        await writeFile(dbPath, JSON.stringify(objectToSave, null, 2));
    }
}
