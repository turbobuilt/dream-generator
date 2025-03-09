// Typescript

// Step 1: Import the required libraries - 'fs/promises' for reading directory content, 'path' for dealing with file paths and 'express' for creating middleware functions.
// Step 2: Define async function 'generateRoutes' which takes one parameter 'app', an Express app.
// Step 3: Read the list of files in the current directory. 
// Step 4: Create a for loop to iterate over all files in the directory.
// Step 5: For each file in the iteration, require the file.
// Step 6: Check if the 'route' export exists in the required file.
// Step 7: If the 'route' export exists, register it as a route with the express app. Lowercase the HTTP method for correct interpretation by express.
// Step 8: The actual method will be the same name as the file, after the extension is trimmed. So, access the method as data.methodName.
// Step 9: End.


import { readdir } from 'fs/promises';
import path from 'path';
import express, { Request } from 'express';
import { authenticateUser, tryAuthenticateUser } from "./authenticateUser"

export async function generateRoutes(app: express.Express): Promise<void> {
    let dir = __dirname
    let files = await readdir(dir);


    app.use(tryAuthenticateUser)

    for (let file of files) {
        let fileName = path.parse(file).name;
        fileName = path.parse(fileName).name;
        if (fileName) {
            let routeData = require(`./${fileName}`);
            let { route, authenticated } = routeData;
            if(!route && typeof authenticated === "boolean") {
                route = { authenticated }
            }
            if(fileName == "getAppPlans") {
                console.log("route is", route)
            }
            if (route && route.authenticated === false && !route.url && fileName.match(/^(get|post|put|delete|patch)[A-Z]/)) {
                route.method = fileName.match(/^(get|post|put|delete|patch)/)[1].toLowerCase();
                route.url = "/api/" + fileName.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`).replace(/^-/, "").replace(/\.ts$/, "");
            }
            if (route && route.url && !route.authenticated) {
                try {
                    let method = route.method?.toLowerCase();
                    if (!method) {
                        let match = route.url.match(/^\/api\/(get|post|put|delete|patch)-/);
                        if (match) {
                            method = match[1].toLowerCase();
                            console.log("method", method)
                        } else {
                            throw new Error("No method specified for route " + route.url);
                        }
                    }
                    app[method](route.url, routeData[fileName] || routeData["default"]);
                } catch (err) {
                    console.log(routeData, fileName)
                    throw err;
                }
            }
        }
    }

    app.use(authenticateUser)

    for (let file of files) {
        let fileName = path.parse(file).name;
        fileName = path.parse(fileName).name;
        if (fileName) {
            let routeData = require(`./${fileName}`);
            let { route } = routeData;
            if (!route && fileName.match(/^(get|post|put|delete|patch)[A-Z]/)) {
                let method = fileName.match(/^(get|post|put|delete|patch)/)[1].toLowerCase();
                route = {
                    url: "/api/" + fileName.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`).replace(/^-/, "").replace(/\.ts$/, ""),
                    method,
                    authenticated: true
                }
            }
            if (route && route.url && route.authenticated) {
                try {
                    let method = route.method?.toLowerCase();
                    if (!method) {
                        let match = route.url.match(/^\/api\/(get|post|put|delete|patch)-/);
                        if (match) {
                            method = match[1].toLowerCase();
                            console.log("method", method)
                        } else {
                            throw new Error("No method specified for route " + route.url);
                        }
                    }
                    app[method](route.url, async function(req: Request, res: express.Response, ...extra: any[]){
                        let result = (routeData[fileName] || routeData["default"])(...arguments);
                        if (result instanceof Promise) {
                            let data = await result;
                        }
                    });
                } catch (err) {
                    console.log("auth", route.url, route.method, fileName)
                    console.log("route data", routeData, "file name", fileName)
                    console.log(routeData)
                    throw err;
                }
            }
        }
    }
}