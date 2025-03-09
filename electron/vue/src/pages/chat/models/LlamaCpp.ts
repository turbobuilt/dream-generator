export class LlamaCpp {
    bytesDownloaded?: number = 0;
    downloadContentLength?: number = 0;
    downloaded?: boolean = false;
    downloadSpeed?: number = 0;
    downloading? = false;
    extracting? = false;
    extracted? = true;
    paused?: boolean = false;
    dl?: any;
    error?: string = "";
}