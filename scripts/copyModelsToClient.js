const sha256 = require("fast-sha256");
const fs = require('fs');
const { ObjectLiteralExpression } = require("ts-morph");

// this file pulls all models from *.controller.ts from the controllers folder and dumps them into the models folder on the client
let statusFilePath = __dirname + "/copyModelsToClientStatus.json";
let status = {};
try {
    status = JSON.parse(fs.readFileSync(statusFilePath, "utf8"));
} catch (err) { }

const { Project, StructureKind, SyntaxKind, OptionalKind, PropertyDeclarationStructure } = require("ts-morph");

async function copyMethods() {
    let start = Date.now();
    var project = new Project({}); // modify ts file
    var files = project.addSourceFilesAtPaths(`${__dirname}/../server/src/methods/**/*.ts`);
    let serverMethodsPath = `${__dirname}/../webapp/src/serverMethods.ts`;
    let methodsListFile = project.addSourceFileAtPathIfExists(serverMethodsPath, null, { overwrite: true });
    if (!methodsListFile)
        methodsListFile = project.createSourceFile(serverMethodsPath, null, { overwrite: true });

    // if methodsListFile doesn't export anything, add export default {} to it
    // export const serverMethods = {}
    if (methodsListFile.getExportSymbols()?.length == 0) {
        methodsListFile.addVariableStatement({
            declarationKind: "const",
            declarations: [{
                name: "serverMethods",
                initializer: "{}",
            }],
            isExported: true,
        });
        await methodsListFile.save();
    }

    // get list of server method names
    let serverMethods = methodsListFile.getVariableDeclaration("serverMethods");
    /**
     * @type {ObjectLiteralExpression}
     */
    let serverMethodsObject = serverMethods.getInitializer();

    let serverMethodNames = serverMethodsObject.getProperties().map(prop => prop.getName());
    let newServerMethodNames = {};
    await Promise.all(files.map(async file => {
        let hash = Buffer.from(sha256(file.getFullText())).toString("base64");
        let name = file.getBaseName().split(".")[0].toString();

        let filePath = file.getFilePath().replace(process.cwd(), ".");
        // console.log(filePath, status[filePath])
        if (status[filePath] == hash) {
            return;
        }
        status[filePath] = hash;
        console.log(name)

        let declarations = file.getExportedDeclarations();
        let newFile = project.createSourceFile(`${__dirname}/../webapp/src/serverMethods/${name}.ts`, null, { overwrite: true });

        // now get the call signature, create the new file, and add the call signature to the new file
        let functionAdded = false;
        for (let [declarationName, [declaration]] of declarations.entries()) {
            if (declaration.getKind() == SyntaxKind.FunctionDeclaration) {
                let funcName = declaration.getName();
                console.log("name", name, "funcname", funcName)
                if (funcName == "default" || !funcName) {
                    funcName = name;
                }
                let func = declaration;
                let callSignature = func.getSignature();
                let returnType = callSignature.getReturnType().getText();
                if (returnType.includes("import") || returnType.includes("express")) {
                    returnType = "";
                }
                // let parametersInfo = func.getParameters();
                let parameters = func.getParameters().map(param => {
                    let paramType = param.getType().getText().split(".").at(-1);
                    let rawType = param.getType().getText();
                    // import the type if it's not a built in
                    if (rawType.includes("import")) {
                        let importPath = rawType.match(/import\("(.+?)"\)/)[1];
                        let importFile = project.addSourceFileAtPathIfExists(importPath + ".ts");
                        if (importFile) {
                            // grab the entire interface and put it in the new file
                            let interface = importFile.getInterface(paramType);
                            if (interface) {
                                newFile.addInterface(interface.getStructure());
                            }
                        }
                    }
                    return {
                        name: param.getName(),
                        type: paramType
                    }
                });
                if (parameters[0]?.name !== "req" || parameters[1]?.name !== "res") {
                    // should not show up in the client
                    console.log("skipping", name, parameters[0]?.name, parameters[1]?.name)
                    // console.log(parameters)
                    continue;
                }
                functionAdded = true;
                parameters = parameters.slice(2);
                if (parameters.length == 0) {
                    parameters.push({
                        name: "data",
                        type: "any",
                        hasQuestionToken: true
                    })
                }
                // add import { callMethod } from "@/lib/callMethod";
                let newFunc = newFile.addFunction({
                    name: funcName,
                    returnType: returnType, // `Promise<${returnType}>`,
                    parameters: parameters,
                    isAsync: false,
                    isExported: true,
                    isDefaultExport: declarationName == "default",
                    statements: `return callMethod("${funcName}", arguments);`
                });
                if (!serverMethodNames.includes(funcName)) {
                    let importInfo = {};
                    if(declarationName == "default") {
                        importInfo.defaultImport = funcName;
                    } else {
                        importInfo.namedImports = [funcName];
                    }
                    methodsListFile.addImportDeclaration({
                        ...importInfo,
                        moduleSpecifier: `./serverMethods/${name}`
                    });
                    console.log("adding serverMethodsObject", funcName)
                    newServerMethodNames[funcName] = funcName;
                }
            }
        }
        if (!functionAdded) {
            console.log("no function added for", name)
        } else {
            newFile.addImportDeclaration({
                namedImports: ["callMethod"],
                moduleSpecifier: "@/lib/callMethod"
            });
            await newFile.save();
            // if not in methods list, add it
        }
    }));
    for (let funcName in newServerMethodNames) {
        serverMethodsObject.addPropertyAssignment({
            name: funcName,
            initializer: newServerMethodNames[funcName]
        });
    }
    fs.writeFileSync(statusFilePath, JSON.stringify(status, null, "\t"));
    await methodsListFile.save();
}

async function copyModels() {
    let start = Date.now();
    var project = new Project({}); // modify ts file
    // var files = project.addSourceFilesAtPaths(`${__dirname}/server/src/features/**/aircraft.model.ts`);
    var files = project.addSourceFilesAtPaths(`${__dirname}/../server/src/models/**/*.ts`);

    await Promise.all(files.map(async file => {
        let hash = Buffer.from(sha256(file.getFullText())).toString("base64");
        let name = file.getBaseName().split(".")[0].toString();

        let filePath = file.getFilePath().replace(process.cwd(), ".");
        // console.log(filePath, status[filePath])
        if (status[filePath] == hash)
            return;
        status[filePath] = hash;

        // return;
        // let name = file.getBaseName().split(".")[0];
        console.log(name)

        let newClasses = [];
        let newEnums = [];

        let classes = file.getClasses();
        let newFile = project.createSourceFile(`${__dirname}/../webapp/src/serverModels/${name}.ts`, null, { overwrite: true });
        for (let classInfo of classes) {
            // console.log(extendsInfo, "was extends")
            var classProps = classInfo.getInstanceProperties();
            let properties = [];
            for (let property of classProps) {
                properties.push({
                    name: property.getName(),
                    type: property.getType() ? property.getType().getText().replace(/import\(.+?\)\./, "") : undefined,
                    initializer: property.getInitializer() ? property.getInitializer().getText() : undefined,
                    hasQuestionToken: true,
                });
            }
            let staticProperties = [];
            var existingStaticProperties = classInfo.getStaticProperties();
            for (let property of existingStaticProperties) {
                properties.push({
                    name: property.getName(),
                    type: property.getType() ? property.getType().getText().replace(/import\(.+?\)\./, "") : undefined,
                    initializer: property.getInitializer() ? property.getInitializer().getText() : undefined,
                    hasQuestionToken: true,
                    isStatic: true
                });
            }

            let methods = [];
            let existingMethods = classInfo.getMethods();
            // add constructor if exists
            if (classInfo.getConstructors().length > 0) {
                let constructor = classInfo.getConstructors()[0];
                let constructorParams = constructor.getParameters();
                let constructorProperties = [];
                for (let param of constructorParams) {
                    constructorProperties.push({
                        name: param.getName(),
                        type: param.getType() ? param.getType().getText().replace(/import\(.+?\)\./, "") : undefined,
                        initializer: param.getInitializer() ? param.getInitializer().getText() : undefined,
                        hasQuestionToken: true,
                    });
                }
                methods.push({
                    name: "constructor",
                    parameters: constructorProperties,
                    statements: constructor.getBodyText(),
                    isConstructor: true,
                })
            }

            // static methods
            for (let method of existingMethods) {
                let statements = [];
                for (let statement of method.getStatements()) {
                    statements.push(statement.getText())
                }
                let existingParameters = method.getParameters();
                let parameters = [];
                for (let param of existingParameters) {
                    parameters.push({
                        name: param.getName(),
                        type: param.getType().getText().split(".").slice(-1)[0]
                    })
                }
                methods.push({
                    name: method.getName(),
                    isAsync: method.isAsync(),
                    isStatic: method.isStatic(),
                    isGenerator: method.isGenerator(),
                    parameters: parameters,
                    statements: statements,
                    hasQuestionToken: method.hasQuestionToken()
                })
            }


            // let extendsInfo = classInfo.getExtends();
            let extendsName = null;
            // if (extendsInfo) {
            //     // console.log(extendsInfo)
            //     let symbol = extendsInfo?.getType().getSymbol();
            //     let declaration = extendsInfo?.getType().getSymbol()?.getDeclarations()[0];
            //     if (declaration) {
            //         extendsName = declaration.getType().getSymbol()?.getName();
            //         let extendsFile = declaration.getSourceFile().getBaseName().split(".")[0];
            //         newFile.addImportDeclaration({
            //             namedImports: [extendsName],
            //             moduleSpecifier: `./${extendsFile}`
            //         });
            //     }
            // }

            newClasses.push({
                name: classInfo.getName(),
                isExported: true,
                properties: properties.concat(staticProperties),
                methods: methods,
                extends: extendsName ? extendsName : undefined,
            });

            // let methods = staticMethods;
            // let constructor = classInfo.getConstructors()[0];
            // if(constructor) {
            //     // newClass.addConstructor(constructor.getStructure());
            //     staticMethods.concat(classInfo.getConstructors()[0].getStructure())
            // }

            // let newClass = newFile.addClass({ 
            //     name: classInfo.getName(), 
            //     isExported: true, 
            //     properties: properties.concat(staticProperties),
            //     methods: methods,
            //     extends: extendsName ? extendsName : undefined,

            // });
            // let constructor = classInfo.getConstructors()[0];
            // if(constructor) {
            //     newClass.addConstructor(constructor.getStructure());
            // }
        }
        let enums = file.getEnums();
        for (let enumInfo of enums) {
            let members = [];
            for (let memberInfo of enumInfo.getMembers()) {
                members.push({
                    name: memberInfo.getName(),
                    value: memberInfo.getValue()
                });
            }
            newFile.addEnum({ name: enumInfo.getName(), isExported: true, members: members })
        }
        newFile.addClasses(newClasses);
        // types
        let types = file.getTypeAliases();
        for (let type of types) {
            newFile.addStatements(type.getText());
        }
        await newFile.save();
    }));
    fs.writeFileSync(statusFilePath, JSON.stringify(status, null, "\t"));
    let end = Date.now();
    console.log((end - start) / 1000)
}
copyModels();
copyMethods();