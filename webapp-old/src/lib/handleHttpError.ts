import { vuetify } from "@/main";
import { createApp } from "vue";
import AlertDialog from "./AlertDialog.vue"

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
    }).use(vuetify)
    app.mount(div);
}