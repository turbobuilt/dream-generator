import { readdir, stat, readFile, writeFile } from 'fs/promises';
import { join } from 'path';

async function listFiles(dir: string): Promise<string[]> {
    const entries = await readdir(dir, { withFileTypes: true });
    const files = await Promise.all(entries
        .filter(entry => !entry.name.startsWith('.'))
        .map(entry => {
            const res = join(dir, entry.name);
            return entry.isDirectory() ? listFiles(res) : Promise.resolve([res]);
        }));
    return Array.prototype.concat(...files);
}

async function main() {
    let files = await listFiles('./dist');
    
    files = files.map(f => f.replace(/^dist\//, '/app/')).filter(file => !file.endsWith('.map'));
    let routerFile = await readFile(__dirname + "/src/routes.ts", "utf8");
    let cachableRoutes: string[] = [];
    let lines = routerFile.split(/\r?\n/);
    for (let line of lines) {
        // if line contains // or /* or */, skip
        if(line.match(/\/\/|\/\*|\*\//)) continue;
        let match = line.match(/path\s*:\s*[\'\"](.+?)[\'\"]/);
        if(!match) continue;
        cachableRoutes.push("/app" + match[1]);
    }
    // console.log(cachableRoutes);

    let data = {
        files: Object.fromEntries(files.map(file => [file, true])),
    } as any;
    for(let route of cachableRoutes) {
        data.files[route] = "/app/";
    }

    let pwaServiceWorker = await readFile(__dirname + "/../website/static/pwaServiceWorker.js", "utf8");
    // append the list as a result of a function call
    let result = pwaServiceWorker.split(/\s*function getOfflineFiles\(\)/)[0] + `\n\nfunction getOfflineFiles() {\n\treturn ${JSON.stringify(data, null, 2)};\n}`;
    console.log(result);

    await writeFile(__dirname + "/../website/static/pwaServiceWorker.js", result, "utf8");
}
main();
