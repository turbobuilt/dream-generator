import { readdir, readFile, writeFile } from "fs/promises";

async function main() {
    let packages = await readdir("node_modules");
    // look for all licenses
    let promises = [] as any;
    for (let packageName of packages) {
        promises.push(getLicense(`node_modules/${packageName}`, true));
    }
    let licenses = await Promise.all(promises);
    licenses = licenses.flat();
    // read common/licenses for all files
    let commonLicenses = await readdir("common/licenses");
    for (let fileName of commonLicenses) {
        let licenseText = await readFile(`common/licenses/${fileName}`, "utf8");
        licenses.push({
            packageName: fileName.replace(/\.txt$/, ""),
            license: licenseText
        });
    }
    console.log(licenses.length);
    await writeFile("vue/src/pages/licenses/licenses.json", JSON.stringify(licenses));
}
main();

async function getLicense(packagePath: string, isRoot) {
    if(packagePath.startsWith("node_modules/@") && isRoot) { 
        let packages = await readdir(packagePath);
        let promises = [] as any;
        for (let packageName of packages) {
            promises.push(getLicense(`${packagePath}/${packageName}`, false));
        }
        let licenses = await Promise.all(promises);
        return licenses.flat();
    }
    // first check if there is a license file
    let license = "";
    try {
        license = await readFile(`node_modules/${packagePath}/LICENSE`, "utf8");
    } catch (e) {
        try {
            let packageJson = JSON.parse(await readFile(`node_modules/${packagePath}/package.json`, "utf8"));
            license = packageJson.license;
        } catch (e) {
            console.log(e);
        }
    }
    return [{
        packageName: packagePath,
        license
    }]
}