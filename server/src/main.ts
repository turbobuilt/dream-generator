// require("source-map-support").install();
// dotenv from ./
require('dotenv').config();
import { readFileSync } from "fs";
let [bunPath, filePath, projectId, port] = process.argv;

import { DbObject, db, connectDb } from "./lib/db";
import { verifyToken } from "./lib/security"

global.print = console.log;

async function globalMain() {
    let dotenvPath = __dirname.replace('build.nosync','src') + "/projects/" + projectId +  "/.env";
    console.log("dotenvpath", dotenvPath);
    require('dotenv').config({ path: dotenvPath });
    await connectDb(projectId);
    globalThis.DbObject = DbObject;
    globalThis.db = db;
    globalThis.verifyToken = verifyToken;

    let { main } = require(`./methods/main`);
    main().catch(err => {
        console.error(err);
    })
}
globalMain();