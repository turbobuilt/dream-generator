import { Model, store } from "../store";

export async function downloadModel(id) {
    let model = store.models[id];
    if (model && model.error) {
        return;
    }
    try {
        model.downloading = true;
        window.nativeBridge.downloadModel({
            id: id,
            onProgress(data: Model) {
                for (let key in data) {
                    model[key] = data[key];
                }
                if (model.downloaded) {
                    
                }
            }
        });
    } catch (err) {
        console.error(err);
        model.error = err.message;
        model.downloading = false;
    }
}