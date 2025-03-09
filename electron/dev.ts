import { build, } from 'esbuild';
import { copy } from 'esbuild-plugin-copy';
import { $ } from "bun";
import { ChildProcess, exec, spawn } from "child_process";
var watch = require('glob-watcher');


var app: ChildProcess ;
var vueApp: ChildProcess ;
async function buildProject() {
    console.log("building...")
    // await $`rm -rf local/build`;
    const res = await build({
        entryPoints: ['./local/src/main.ts','./local/src/preload.ts'],
        bundle: true,
        platform: "node",
        target: "es2022",
        sourcemap: true,
        tsconfig: './tsconfig.json',
        external: ['electron','openvino-node'],
        outdir: './local/build',
        plugins: [
            copy({
                resolveFrom: 'cwd',
                assets: {
                    from: ['local/src/**/*.html'],
                    to: ['local/build'],
                },
            }),
        ],
    });

    if (app) {
        await Promise.allSettled([killProcess(app.pid), killProcess(vueApp.pid)]);
        // app.stderr?.destroy();
        // app.stdin?.destroy();
        // app.stdout?.destroy();
        // app.kill();
        // vueApp.stderr?.destroy();
        // vueApp.stdin?.destroy();
        // vueApp.stdout?.destroy();
        // vueApp.kill();
        // var kill = require("tree-kill")
        // console.log("killing", app.pid, vueApp.pid)
        // kill(app.pid, app.killed);
        // kill(vueApp.pid)
        // while (app.killed == false && vueApp.killed == false) {
        //     console.log("witing for app to close");
        //     await new Promise(resolve => setTimeout(resolve, 250));
        // }
    }
    
    // wait .5 seconds
    await new Promise(resolve => setTimeout(resolve, 500));
    vueApp = spawn('npx', ['vite', '--port', '5000'], { stdio: 'inherit', cwd: process.cwd() + "/vue", shell: true });
    app = spawn('npx', ['electron', '--enable-logging', '--inspect', 'local/build/main.js'], { shell: true, stdio: 'inherit' });
}

async function killProcess(pid) {
    if (process.platform === "win32") {
        // Windows-specific command to forcefully kill a process by its PID
        return new Promise((resolve, reject) => {
            exec(`taskkill /PID ${pid} /F /T`, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error killing process ${pid}:`, stderr);
                    reject(error);
                } else {
                    console.log(`Process ${pid} killed successfully`);
                    resolve(stdout);
                }
            });
        });
    } else {
        // For non-Windows platforms, use tree-kill or similar methods
        return new Promise((resolve, reject) => {
            var kill = require("tree-kill");
            kill(pid, 'SIGKILL', (error) => {
                if (error) {
                    console.error(`Error killing process ${pid}:`, error);
                    reject(error);
                } else {
                    console.log(`Process ${pid} killed successfully`);
                    resolve(pid);
                }
            });
        });
    }
}

watch(['local/src/**/*.*'], async function (done) {
    try {
        await buildProject();
    } catch (err) {
        console.error(err);
    }
    done();
});
buildProject();