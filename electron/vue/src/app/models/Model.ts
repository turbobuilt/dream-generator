import { join } from "path";
import { Database } from "../lib/database";
import { getCwd, getModelsDir } from "../lib/paths";
import { getPlatformInfo } from "../llm/downloadLlamaCpp";
// import { InferenceServer } from "./InferenceServer";
import { isPackaged } from "../lib/util";

export class ModelData {
    constructor(model: ModelData = {} as any) {
        Object.assign(this, model);
    }

    type: "text" | "image" | "audio"
    id: string
    prettyName: string
    downloadUrl: string
    estimatedSize?: number = 1;
    description: string
    bytesDownloaded?: number = 0;
    downloadContentLength?: number = 0;
    downloaded?: boolean = false;
    downloadSpeed?: number = 0;
    downloading? = false;
    executablePath?: string;
    extract? = false;
    // inferenceServer?: InferenceServer;
    extractFunction?: (model: Model, onProgress: (model: Model) => void) => Promise<void>;
    extracted? = false;
    extracting? = false;
    getCommandArgs?: () => Promise<string[]>;
    
    paused?: boolean = false;
    dl?: any;
    error?: string = "";
}

export class Model extends ModelData {
    static savedFields = ["extracted", "downloaded"];
    platformExecutablePath: string;
    commandArgs: string[];
    constructor(model: ModelData = {} as any) {
        super(model);
    }

    async init() {
        this.platformExecutablePath = await this.getPlatformExecutablePath();
        this.commandArgs = await this.getCommandArgs();
    }

    static async loadAll(models: Model[]) {
        for (let model of models) {
            await model.load();
        }
    }

    async getModelPath() {
        let modelsDir = await getModelsDir();
        return join(modelsDir,this.id);
    }

    async getDownloadLocalPath() {
        let modelPath = await this.getModelPath();
        return modelPath + "_raw";
    }

    async load() {
        let table = await Database.table("Model");
        if (table[this.id]) {
            Object.assign(this, table[this.id]);
        }
    }

    async save() {
        let table = await Database.table("Model");
        table[this.id] = this;
        await Database.save();
    }

    async getPlatformExecutablePath() {
        let { platform, arch } = await getPlatformInfo();
        let executablePath = this.executablePath as any;
        executablePath = join(await getCwd(), executablePath);
        let fullPath = `${executablePath}_${platform}_${arch}`;
        if (platform === "win32") {
            fullPath += ".exe";
        }
        return fullPath;
    }
}