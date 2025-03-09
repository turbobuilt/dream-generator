import { readdir } from "fs/promises";
import express, { Request } from 'express';
import { join } from "path";
import { authenticateUser, authenticateUserInternal } from "../methods/authenticateUser";

let allMethods = {} as {
    [methodName: string]: {
        httpMethod?: string,
        authenticated?: boolean,
        function: Function
    }
};

export async function exposeMethods(app: express.Express): Promise<void> {
    // return;
    // list all ts files in "src/methods" directory
    // let files = await readdir("src/methods");
    let files = await readdir(join(__dirname, "..", "methods"));
    // console.log("reading", join(__dirname, "..", "methods"));
    // console.log("files", files);
    for (let fileName of files) {
        // console.log("checking", fileName);
        // if it ends in .map, skip
        if (fileName.endsWith(".map")) {
            continue;
        }
        fileName = fileName.replace(/\.[tj]s$/i, "");
        // console.log(file, process.cwd());
        let location = join("../methods", fileName);
        // console.log(location);
        let fileData = require(location);
        // if starts with get/post/put/delete, extract
        let httpMethod = null;
        let match = fileName.match(/^(get|post|put|delete)(.*)/);
        if (match) {
            httpMethod = match[1];
            fileName = match[2].replace(/^[A-Z]/, (c) => c.toLowerCase());
        }
        let routeData = fileData.route || {
            // url: null,
            // method: null,
            authenticated: true
        };
        // console.log("routeData", routeData.method?.toLowerCase(), httpMethod?.toLowerCase());
        if (routeData.method && httpMethod && routeData.method.toLowerCase() !== httpMethod.toLowerCase()) {
            // console.log(location);
            console.error(`Method mismatch for ${fileName}`);
            // throw new Error(`Method mismatch for ${fileName}`);
        }
        if (!routeData) {
            routeData = {
                authenticated: true,
            }
        }

        // get all named exports from the file that are functions
        let functions = Object.entries(fileData).filter(([key, value]) => typeof value === "function");
        for (let [key, fn] of functions) {
            let methodName = key === "default" ? fileName : key;
            allMethods[methodName] = {
                authenticated: routeData.authenticated,
                function: fn as any
            };
        }
    }

    app.post("/api/method-call", async function (req: Request, res) {
        try {
            console.log("did method call")
            let { args, methodName } = req.body;
            let method = await allMethods[methodName];
            if (method === undefined) {
                return res.json({ error: "Method not found" });
            }
            let { success, error } = await authenticateUserInternal(req, res);
            if (method.authenticated && !success) {
                return res.status(401).json({ error });
            }
            // if(typeof args[0] === "object") {
            //     Object.assign(req.query, args[0]);
            // }
            req.body = args[0];
            // req.query = args[0]
            // Object.defineProperty(req, "query", args[0])
            // console.log("query is", req.query, args[0]);
            let result = await method.function(req, res, ...args);
            if (!res.headersSent)
                return res.json(result);
            return null;
        } catch (err) {
            console.trace(err);
            return res.json({ error: err.message });
        }
    });
}