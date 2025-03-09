import Handlebars from "handlebars";
import * as fs from "fs/promises"
// Handlebars.registerPartial('myPartial', '{{prefix}}');
let partialDir = __dirname.replace("/build.nosync/", "/src/") + '/../partials/';
fs.readdir(partialDir).then(async partials => {
    console.log(partials);
    let promises = await Promise.all(partials.map(async partial => {
        let name = partial.split(".")[0];
        let content = await fs.readFile(partialDir + partial, 'utf8');
        Handlebars.registerPartial(name, content);
    }))
})

export async function handlebars() {

}

