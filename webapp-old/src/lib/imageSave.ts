interface SavedImageData {
    id: number,
    model: string,
    arrayBuffer: ArrayBuffer,
    prompt: string,
    date: Date|string,
    taskId: string,
    style: string
}


export async function getImageDb() {
    let db = indexedDB.open("images", 1);
    return new Promise<IDBDatabase>((resolve, reject) => {
        db.onsuccess = () => {
            resolve(db.result);
        }
        db.onerror = (err) => {
            console.error("error loading images from indexeddb");
            reject(err);
        }
        db.onupgradeneeded = (ev) => {
            console.log("event", ev, "upgrade needed")
            if (!db.result.objectStoreNames.contains("images"))
                db.result.createObjectStore("images" as any, { keyPath: "taskId" });
        }
    });

}

export async function getImage(taskId) {
    let db = await getImageDb();
    return new Promise<SavedImageData>((resolve, reject) => {
        let transaction = db.transaction("images", "readwrite");
        let store = transaction.objectStore("images");
        let request = store.get(taskId);
        request.onsuccess = () => {
            let image = request.result;
            if (image) {
                image.url = URL.createObjectURL(new Blob([image.arrayBuffer]));
                resolve(image);
            } else {
                reject("no image found");
            }
        }
        request.onerror = (err) => {
            console.error("error getting image from indexeddb");
            reject(err);
        }
    });
}

export async function getImages() {
    let db = await getImageDb();
    return new Promise<SavedImageData[]>((resolve, reject) => {
        let transaction = db.transaction("images", "readwrite");
        let store = transaction.objectStore("images");
        let request = store.getAll();
        request.onsuccess = () => {
            let images = request.result.map((image: any) => {
                return Object.assign(image, {
                    url: URL.createObjectURL(new Blob([image.arrayBuffer]))
                })
            })
            images.sort((a, b) => {
                return new Date(b.date).getTime() - new Date(a.date).getTime();
            });
            console.log("images", images.map(item => item.taskId).join("\n"))
            console.log(images.findIndex(item => item.taskId === "4ac82b07-5e64-49f9-aa74-75345704a80a-e1"))
            resolve(images);
        }
        request.onerror = (err) => {
            console.error("error getting images from indexeddb");
            reject(err);
        }
    });
}

export async function saveImage(data: SavedImageData) {
    let db = indexedDB.open("images", 1);
    db.onsuccess = () => {
        let transaction = db.result.transaction("images", "readwrite");
        let store = transaction.objectStore("images");
        let request = store.put(data);
    }
    db.onerror = (err) => {
        console.error("error saving image to indexeddb", err);
    }
    db.onupgradeneeded = (ev) => {
        console.log("event", ev, "upgrade needed")
        if (!db.result.objectStoreNames.contains("images"))
            db.result.createObjectStore("images" as any, { keyPath: "taskId" });
    }
}

export async function deleteImage(taskId: string) {
    let db = indexedDB.open("images", 1);
    db.onsuccess = () => {
        let transaction = db.result.transaction("images", "readwrite");
        let store = transaction.objectStore("images");
        let request = store.delete(taskId);
    }
    db.onerror = (err) => {
        console.error("error deleting image from indexeddb", err);
    }
    db.onupgradeneeded = (ev) => {
        console.log("event", ev, "upgrade needed")
        if (!db.result.objectStoreNames.contains("images"))
            db.result.createObjectStore("images" as any, { keyPath: "taskId" });
    }
}