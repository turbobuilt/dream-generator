import { exec } from "child_process";
import kill from "tree-kill";

export async function forceKill(pid) {
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
        // For non-Windows platforms, use tdefault kill
        return new Promise((resolve, reject) => {
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