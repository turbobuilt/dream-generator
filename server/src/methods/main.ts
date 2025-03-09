// typescript

/*
Step-by-step Plan:

1. Import the necessary functions and types from their respective modules.
2. Define the async function named 'main'.
3. Call the 'createApp' function to create an express application.
4. Call the 'generateRoutes' function and pass the created Express app as an argument.
5. Call the 'startListener' function and pass the Express app as an argument.
6. Return the Express app instance.
*/

// Import the necessary functions and types
require("source-map-support").install()
require('dotenv').config({ path: __dirname.replace('build.nosync', 'src') + "/../.env" })
import { createApp } from "./createApp";
import { generateRoutes } from "./generateRoutes";
import { startProxyListener } from "./startListener";
import * as express from 'express';
import { startListeningPubSub } from "./androidTransactionWebhook";
import { handleErrors } from "./handleErrors";
import moment from "moment";
import { runMigrations } from "../migrations";
import { initializeApp, cert } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";
import googleInfo from "../firebase";
import { hostname } from "os";
import Handlebars from "handlebars";
import { readFile, stat } from "fs/promises";
import { queueAutomatedEmailsCron, sendQueuedEmailsCron, startTrialAutomailerCron } from "../models/AutomailerSubscription";
import { exposeMethods } from "../lib/exposeMethods";
import { startBillSubscriptionsCron } from "./verifyStripePayment";
import cors from "cors"

export const firbaseApp = initializeApp({ credential: cert(googleInfo as any) });
export const firebaseMessaging = getMessaging(firbaseApp);
export const globalTemplateVariables = { origin: null };
Handlebars.registerHelper('origin', () => globalTemplateVariables.origin);

export async function main() {
    console.log("Starting main")
    await runMigrations();
    setInterval(() => global.db.query("SELECT 1").catch(err => { console.error(err) }), 1000 * 60 * 30);
    setInterval(clearUrls, 1000 * 60 * 60 * 24);
    let app = await createApp();
    let staticPath = hostname().includes("devmbp") ? '/Users/dev/Documents/prg/dreamgenerator.ai/website/build' : "/home/dreamgenerator/website";
    startTrialAutomailerCron.start();
    queueAutomatedEmailsCron.start();
    sendQueuedEmailsCron.start();
    startBillSubscriptionsCron();
    // if (process.env.NODE_ENV === "production")
        // ensureCertValid().catch(err => console.error("erro getting cert"))

    app.use(cors())
    // middleware so that if it starts with /app/* it will serve the contents of ${staticPath}/create for all routes
    app.use("/app/", async (req, res, next) => {
        if (req.url.split("?")[0].indexOf(".") === -1) {
            let webAppHome = await readFile(staticPath + "/app/index.html", "utf8");
            res.contentType("text/html").send(webAppHome);
        } else {
            next();
        }
    });
    app.get("/create", (req, res, next) => {
        res.redirect("/app/create");
    });
    app.use(express.static(staticPath, {
        index: "index.html", extensions: ['html'], dotfiles: 'allow'
    }));
    app.use(function (req: express.Request, res, next) {
        if (!globalTemplateVariables.origin) {
            let host = req.headers.host || req.headers.hostname;
            // if host includes localhost or dreamgenerator.ai set origin appropriately
            if (host.includes("localhost") || host.includes("dreamgenerator.ai")) {
                globalTemplateVariables.origin = "https://" + host;
            } else {
                globalTemplateVariables.origin = "https://dreamgenerator.ai";
            }
        }
        next();
    });
    app.head("/status", async (req, res) => res.json({ sqlDate: (await global.db.query("SELECT NOW() as now"))[0] }));

    // Generate routes
    await exposeMethods(app);
    await generateRoutes(app);
    await handleErrors(app);
    await startProxyListener(app);
    // await startList(app);
    await startListeningPubSub();

    return app; // Return the created Express instance
}

async function clearUrls() {
    try {
        await global.db.query("UPDATE ImageGenerationRequest SET outputUrl=NULL WHERE outputUrl IS NOT NULL AND created < ?", [moment().subtract(24, "hours").toDate().getTime()]);
    } catch (e) {

    }
}

// function ensureCertValid() {
//     throw new Error("Function not implemented.");
// }
