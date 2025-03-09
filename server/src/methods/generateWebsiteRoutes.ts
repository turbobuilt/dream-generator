import { readFile } from "fs/promises";

let webapp = null;
export async function generateWebsiteRoutes(app, staticPath) {
    app.get(["/create"], async function (req, res) {
        // load static 
        if (webapp === null) {
            webapp = await readFile(staticPath + "/webapp.html", "utf8");
        }
        res.send(webapp);
    })
}