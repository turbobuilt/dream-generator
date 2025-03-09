import { ipcMain, ipcRenderer } from "electron";
import { unlink } from "fs/promises";
// import { models } from "../models/models";
// import { ImageModelServer } from "./ImageModelServer";
// import { getTmpPath } from "../lib/paths";
import { join } from "path";
import { ImageModelServer } from "./ImageModelServer";

let servers = {} as { [modelId: string]: ImageModelServer };

export const imageFunctions = {
    async startImageServer(model, onStatusChange: (string, ramUsage?) => void, onComplete?: (Buffer) => void) {
        // let model = models[id];
        console.log("id", model)
        servers[model.id] = new ImageModelServer();
        let server = servers[model.id];
        server.init(model, onStatusChange, onComplete as any);
        await server.startServer();
    },
    async stopImageServer(model) {
        // let model = models[id];
        let server = servers[model.id];
        if(server) {
            await server.stopServer();
        }
    },
    async generateImage({ model, steps, prompt, onStatusChange, onComplete }) {
        prompt = prompt.replace(/\n/g, " ");
        let lower = prompt.toLowerCase();
        // words for anybody less than 18
        let youngPeople = ["child", "kid", "baby", "toddler", "infant", "newborn", "youth", "youngster", "teen", "teenager", "adolescent", "young person", "minor", "juvenile", "preteen", "prepubescent", "pubescent", "little boy", "little girl", "young boy", "young girl"];
        let bannedWords = ["naked", "nude", "nudey", "nudie", "nudity", "nakedness", "no clothing", "without clothes", "kiss", "sexy", "hot", "erotic", "having sex", "sexual", "doing sex", "naturism", "nkd", "xxx", "gay", "lesbian", "bisexual", "homosexual", "homo", "boobs", "tits", "vagina", "penis", "anus", "breast", "oral", "making out", "anal", "clitoris"]
        if (youngPeople.some(word => lower.includes(word)) && bannedWords.some(word => lower.includes(word))) {
            throw new Error("Sorry, this goes against content filters.");
        }

        // let model = models[modelId];
        let server = servers[model.id]
        server.onStatusChange = onStatusChange;
        server.onComplete = onComplete;
        // each line will be formatted like this steps={num_steps},seed={seed},prompt={prompt}
        let seed = Math.round(Math.random() * 100000);
        // let tmpPath = preloadData.tmpPath;
        let tmpPath = await ipcRenderer.invoke('getTmpPath');
        let imgPath = join(tmpPath, `output.bmp`);
        let command = `steps=${steps},seed=${seed},output_path=${imgPath},prompt=${prompt}`;
        server.server.stdin.write(command + "\n");
    }
}