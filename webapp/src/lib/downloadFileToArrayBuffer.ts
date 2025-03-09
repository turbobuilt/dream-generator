

// export default function (url, onProgress: (percent) => void): Promise<ArrayBuffer> {
//     return new Promise(async function (resolve, reject) {
//         let blob = await (await fetch(url, { credentials: "omit" })).blob();
//         // let urlObject = window.URL.createObjectURL(blob);
//         let fileReader = new FileReader();
//         fileReader.onload = () => {
//             let arrayBuffer = fileReader.result;
//             resolve(arrayBuffer);
//         }
//         fileReader.onerror = (err) => {
//             console.error(err);
//             reject(err);
//         }
//         fileReader.readAsArrayBuffer(blob);
//     })
// }


export default function (url, onProgress: (percent: number) => void): Promise<{ arrayBuffer: ArrayBuffer, contentType: string, extension: string }> {
    return new Promise(async function (resolve, reject) {
        try {
            const response = await fetch(url, { credentials: "omit" });
            if (!response.ok) return reject(new Error(`Failed to download file: ${response.statusText}`));

            const contentLength = response.headers.get('content-length');
            if (!contentLength) return reject(new Error('Content-Length header missing'));

            const total = parseInt(contentLength, 10);
            let loaded = 0;

            const reader = response.body.getReader();
            const chunks = [];
            let lastProgress = Date.now();
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                chunks.push(value);
                loaded += value.length;
                if (Date.now() - lastProgress < 1000) continue;
                lastProgress = Date.now();
                onProgress((loaded / total) * 100);
            }

            const blob = new Blob(chunks);
            const arrayBuffer = await blob.arrayBuffer();
            let contentType = response.headers.get('content-type');
            let extension = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/avif': 'avif' }[contentType] || "png";
            resolve({ arrayBuffer, contentType: contentType, extension });
        } catch (err) {
            console.error(err);
            reject(err);
        }
    });
}