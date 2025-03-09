import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import { readFile } from "fs/promises";
import sharp from "sharp";
import Jimp from "jimp";
import { join } from "path";
import { getCwd } from "../lib/paths";
import { killProcess } from "../lib/killProcess";
var pidusage = require('pidusage')


export class ImageModelServer {
    model: Model;
    server: ChildProcessWithoutNullStreams;
    status: string;
    onComplete: (Buffer) => void;
    onStatusChange: (string, ramUsage) => void;

    init(model: Model, onStatusChange: (string, ramUsage) => void, onComplete: (Buffer) => void) {
        this.model = model;
        console.log("THE MODEL IS ", model)
        this.onStatusChange = onStatusChange;
        this.onComplete = onComplete;
    }

    async stopServer() {
        if (this.server && !this.server.killed) {
            killProcess(this.server.pid);
            // this.server.kill();
        }
    }

    async getRamUsage() {
        return new Promise((resolve, reject) => {
            pidusage(this.server.pid, function (err, stats) {
                if (err) {
                    reject(err);
                }
                resolve(stats);
            });
        });
    }


    async startServer() {
        let envVars = {} as any;
        let cwd = await getCwd();
        // envVars["INTEL_OPENVINO_DIR"] = process.env.INTEL_OPENVINO_DIR;
        // ${cwd}/common/openvino_2023 is where libs are
        // envVars["OPENVINO_LIB_PATHS"] = join(cwd, "common","openvino_2023");
        // envVars["PATH"] = process.env.PATH + `:${join(cwd, "common","openvino_2023")}`;
        // envVars["TOKENIZER_PATH"] = envVars["OPENVINO_LIB_PATHS"];
        console.log("env vars", envVars, cwd)

        if (this.server && !this.server.killed) {
            this.server.kill();
        }
        let platformExecutablePath = await this.model.platformExecutablePath;
        let args = await this.model.commandArgs;
        for(let i = 0; i < args.length; i++) {
            args[i] = `"${args[i]}"`;
        }
        console.log("command", platformExecutablePath, args)
        this.server = spawn(`"${platformExecutablePath}"`, args, { 
            stdio: "pipe",
            cwd: cwd,
            shell: true,
            // cwd: join(cwd, "common","openvino_2023"),
            env: envVars 
        });
        console.log("server started", this.server.pid)
        this.server.stdout.on('data', async (stdout) => {
            console.log(`stdout: ${stdout}`);
            let lines = stdout.toString();
            for(let data of lines.split(/\r?\n/)) {
                if (data.startsWith('status: complete')) {
                    let outPath = data.replace('status: complete ', '').trim();
                    let img = await Jimp.read(outPath);
                    let jpg = await img.quality(100).getBufferAsync(Jimp.MIME_JPEG);
                    // let buffer = await readFile(outPath);
                    // let jpg = await sharp(buffer).jpeg({ quality: 100 }).toBuffer();
                    this.onComplete(jpg);
                } else if (data.startsWith('status: ')) {
                    this.status = data.replace('status: ', '').trim();
                    console.log("sending progress", this.status)
                    this.onStatusChange(this.status, null);
                }else {
                    console.log("not sending progress", stdout.toString())
                }
            }
        });
        this.server.stderr.on('data', (stderr) => {
            console.error(`stderr: ${stderr}`);
        });
        this.server.on('close', (code) => {
            console.log(`child process exited with code ${code}`);
        });
    }
}