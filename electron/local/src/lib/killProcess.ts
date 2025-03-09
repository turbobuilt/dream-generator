import { exec } from "child_process";

export async function killProcess(pid) {
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