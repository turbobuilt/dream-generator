import { FFmpeg } from '@ffmpeg/ffmpeg';
// import ./ffmpeg-core.js and ./ffmpeg-core.wasm from the same directory as blob urls
import wasmURL from './ffmpeg-core.wasm?url';
import coreURL from './ffmpeg-core.js?url';


export async function loadFFmpeg(onLog) {
    const ffmpeg = new FFmpeg();
    ffmpeg.on('log', ({ message }) => {
        onLog(message);
    });
    await ffmpeg.load({
        coreURL: coreURL,
        wasmURL: wasmURL
    });
    return ffmpeg;
}

export async function convertToOutputFormat(inputData: Uint8Array, outputExtension: string, sampleRate: number) {
    const ffmpeg = await loadFFmpeg((msg) => {
        console.log(msg);
    });
    ffmpeg.on('progress', ({ progress, time }) => {
        console.log(`progress: ${progress}, time: ${time}`);
    });

    await ffmpeg.writeFile('data', inputData);
    let outFile = `output.${outputExtension}`;
    await ffmpeg.exec(['-i', 'data', '-ar', sampleRate.toString(), outFile]);
    const data = await ffmpeg.readFile(outFile);
    await ffmpeg.deleteFile('data');
    await ffmpeg.deleteFile(outFile);
    return data;
}


// extracts audio and converts to 16khz wav
export async function extractAudio(inputData: Uint8Array, onProgress) {
    let logs = "";
    const ffmpeg = await loadFFmpeg((msg) => {
        logs += msg + "\n";
    });
    ffmpeg.on('progress', ({ progress, time }) => {
        onProgress({ progress, time });
        console.log(`progress: ${progress}, time: ${time}`);
    });

    await ffmpeg.writeFile('data', inputData);

    await ffmpeg.exec(['-i', 'data', '-f', 'wav', '-bitexact', '-acodec', 'pcm_s16le', '-ar', '16000', '-ac', '1', '-map_metadata', '-1', 'output.wav']);
    const data = await ffmpeg.readFile('output.wav');
    await ffmpeg.deleteFile('data');
    await ffmpeg.deleteFile('output.wav');
    let typeMatch = logs.match(/Input #0, (.+), from /);
    var extension = null;
    if(typeMatch) {
        let extensionList = typeMatch[1].split(",") || [];
        if(extensionList[0] === "mov")
            extensionList[0] = "mp4";
        extension = extensionList[0];
    }
    let sampleRate = null;
    let hzMatch = logs.match(/Stream.+Audio:.+([0-9]+) Hz/);
    if(hzMatch) {
        sampleRate = hzMatch[1];
    }

    return { data, extension, sampleRate }
}