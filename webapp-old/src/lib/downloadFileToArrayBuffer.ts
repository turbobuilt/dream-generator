

export default function(url) : Promise<ArrayBuffer>  {
    return new Promise(async function (resolve, reject){
        let blob = await (await fetch(url, { credentials: "omit" })).blob();
        // let urlObject = window.URL.createObjectURL(blob);
        let fileReader = new FileReader();
        fileReader.onload = () => {
            let arrayBuffer = fileReader.result;
            resolve(arrayBuffer);
        }
        fileReader.onerror = (err) => {
            console.error(err);
            reject(err);
        }
        fileReader.readAsArrayBuffer(blob);
    })
}