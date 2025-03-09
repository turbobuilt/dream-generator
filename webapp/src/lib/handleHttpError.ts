import { createApp } from "vue";
import AlertDialog from "./AlertDialog.vue"
import { addConfig } from "@/config";

export async function handleHttpError(err, reason = "Unexpected error") {
    let msg = err?.response?.data?.error || err?.response?.data || err?.message || err;
    console.error(reason, msg);

    // create a simple vue material app and present the dialog
    let div = document.createElement("div");
    // add root props
    const app = createApp(AlertDialog, {
        content: msg,
        onClose() {
            app.unmount();
            div.remove();
        }
    })
    addConfig(app);
    app.mount(div);
}

export function showHttpErrorIfExists(response, task = "Unknown") {
    if (response.error) {
        handleHttpError(response.error, `${task}`);
        return true;
    }
    return false;
}