import * as fs from "fs";
import * as fsp from "fs/promises"
import * as sass from "sass"
import minifyHtml from "@minify-html/node";
import { marked } from "marked";

if (!fs.existsSync("build")) {
    fs.mkdirSync("build");
}

async function processFile(file, mainScss, template) {
    let content = await Bun.file(file).text()
    let split = content.split(`===========
resources`);
    let rawResources = "";
    if (split.length == 2) {
        rawResources = split[1];
    }
    content = split[0]
    let resources = rawResources.trim().split("\n").map(r => r.trim()).filter(r => r);
    for (let resource of resources) {
        let info = resource.match(/^(.+?)\:(.+?)\:(.+)/);
        // console.log(resource)
        let type = info[1];
        let name = info[2];
        let data = info[3];
        // replace insteances of %name% with the data
        content = content.replace(new RegExp(`%${name}%`, "g"), data);
    }


    let header = content.split("<")[0];
    content = content.slice(header.length);
    let description = "", title = "Dream Generator AI Art";
    if (header) {
        let lines = header.split("\n");
        for (let line of lines) {
            if (line.startsWith("description:")) {
                description = line.split("description:")[1].trim();
            } else if (line.startsWith("title:")) {
                title = line.split("title:")[1].trim();
            }
        }
    }
    let parts = template.split("<head>");
    template = parts[0] + `<head>\n\t\t<title>${title}</title>\n\t\t<meta name="description" content="${description}">` + template.slice(parts[0].length + "<head>".length);

    let bodyTag = "<body>";
    let bodyIndex = template.indexOf(bodyTag);
    let fileName = file.split("/").pop().split(".")[0];
    let result = { css: "" }
    let scssFilePath = `src/styles/${fileName}.scss`;
    // check if exists asynchronously wiht await
    try {
        await fsp.stat(scssFilePath);
        result = await sass.compileAsync(`src/styles/${fileName}.scss`, { style: "compressed" });
    } catch (err) { }
    let styleTag = `<style>\n${mainScss.css}\n${result.css.toString()}\n</style>`;
    let output = template.slice(0, bodyIndex + bodyTag.length) + styleTag + content + template.slice(bodyIndex + bodyTag.length);
    // newContent = minifyHtml.minify(Buffer.from(newContent), {}).toString("utf-8");
    let blob = new Blob([output], { type: "text/html" });
    await Bun.write(`build/${fileName}.html`, blob);
}

async function processBlogPosts() {
    console.log("Processing blog posts");
    if (!fs.existsSync("build/posts"))
        await fsp.mkdir("build/posts", { recursive: true });
    let postFiles = await fsp.readdir("blog/posts");
    let template = await Bun.file("src/pages/blog-post.html").text();
    let posts = [];

    for (let postFile of postFiles) {
        console.log(postFile);
        let raw = await Bun.file(`blog/posts/${postFile}`).text();
        let lines = raw.split("\n");
        let urlLine = lines[0].split("url")[1].trim();
        let titleLine = lines[1].split("title")[1].trim();
        let markdownContent = lines.slice(2).join("\n");
        let htmlContent = marked(markdownContent);

        let fullPage = template.replace("POST_CONTENT_HERE", htmlContent);
        await Bun.write(`build/posts/${urlLine}.html`, fullPage);
        posts.push({ url: urlLine, title: titleLine });
    } 

    let blogIndex = await Bun.file("build/blog.html").text();
    let postPlaceholderRegex = /<POST class="post-link">([\s\S]*?)<\/POST>/;
    let match = blogIndex.match(postPlaceholderRegex);
    if (match) {
        let repeatedSnippets = posts.map(p => `<div class="post-link"><a href="/posts/${p.url}">${p.title}</a></div>`).join("\n");
        blogIndex = blogIndex.replace(postPlaceholderRegex, repeatedSnippets);
    }
    await Bun.write("build/blog.html", blogIndex);
}

async function main() {
    let pages = await fsp.readdir("src/pages");
    let mainScss = sass.compile("src/styles/main.scss", { style: "compressed" });
    let mainTemplate = await Bun.file("src/templates/main.tpl").text();
    let promises = [];
    for (let page of pages) {
        promises.push(processFile(`src/pages/${page}`, mainScss, mainTemplate));
    }
    await Promise.all(promises);
    await copyDir("assets", "build/assets");
    await copyDir("static", "build");
    await processBlogPosts();
}
main()

async function processThoughts() {
    let content = await Bun.file("src/pages/thoughts.html").text();
    let parts = content.split("<body>");
}

// function that asyncronously using promises recursively copies a directory
async function copyDir(src, dest) {
    let files = await fsp.readdir(src);
    for (let file of files) {
        let srcPath = `${src}/${file}`;
        let destPath = `${dest}/${file}`;
        let stat = await fsp.stat(srcPath);
        try {``
            if (stat.isDirectory()) {
                if (!fs.existsSync(destPath))
                    await fsp.mkdir(destPath, { recursive: true });
                await copyDir(srcPath, destPath);
            } else {
                await fsp.copyFile(srcPath, destPath);
            }
        } catch (err) {
            console.error(`Error copying ${srcPath} to ${destPath}:`, err);
        }
    }
}
