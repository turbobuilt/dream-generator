// New optimized code:

import * as fs from "fs";
import mysql from "mysql2/promise";
import { db } from "./db";



type ColumnDefinition = {
    type: "BIGINT" | "VARCHAR" | "DECIMAL" | "TINYINT" | "TEXT" | "FLOAT" | "DOUBLE" | "DATE" | "DATETIME" | "TIMESTAMP" | "MEDIUMTEXT" | "LONGTEXT" | "ENUM" | "INT" | "SMALLINT" | "MEDIUMINT" | "JSON";
    decimalTotalDigits?: number;
    decimalFractionalDigits?: number;
    length?: number;
    notNull: boolean;
    autoIncrement?: boolean;
    enumValues?: string[];
};
type IndexDefinition = {
    [indexName: string]: {
        unique: boolean;
        columns: string[];
    };
};
type DBDefinition = {
    [tableName: string]: TableDefinition;
};
type TableDefinition = {
    columns: {
        [columnName: string]: ColumnDefinition;
    };
    indexes: IndexDefinition;
    foreignKeys: {
        [columnName: string]: {
            foreignKeyName: string,
            references: {
                table: string;
                column: string;
            };
        }
    };
};

const dbDefinition: DBDefinition = {};

export async function handleQueryFailure(connection, tableName, result) {

}

export async function checkAndAlterTable(connection, tableName, data) {
    if (!dbDefinition[tableName]) {
        const createTableSql = `CREATE TABLE ${tableName} (id bigint NOT NULL AUTO_INCREMENT, PRIMARY KEY (id), ${Object.entries(data)
            .map(([key, value]) => `${generateColumnSql(determineColumnType(value, key), key)}`)
            .join(", ")})`;


        await connection.query(createTableSql);

        fs.appendFileSync("migrations.txt", createTableSql + "\n");

        dbDefinition[tableName] = {
            columns: {},
            indexes: {},
            foreignKeys: {},
        };

        Object.keys(data).forEach((key) => {
            dbDefinition[tableName].columns[key] = determineColumnType(data[key], key);
        });

    }


    const tableDefinition = dbDefinition[tableName];
    const columnsToAdd: { columnName: string, newType: ColumnDefinition }[] = [];
    const columnsToModify: { columnName: string, newType: ColumnDefinition }[] = [];
    const dataToInsert = {};

    // console.log(tableDefinition.columns);
    // return;

    for (let [key, value] of Object.entries(data)) {
        const columnDefinition = tableDefinition.columns[key];
        let newType: ColumnDefinition;

        if (!columnDefinition) {
            newType = determineColumnType(value);
            columnsToAdd.push({ columnName: key, newType });
        } else {
            let compatible = isTypeCompatible(value, columnDefinition)
            if (!compatible.isCompatible) {
                if (compatible.mustModifyTo) {
                    columnsToModify.push({ columnName: key, newType: compatible.mustModifyTo });
                } else {
                    throw new Error(`Incompatible data type for column ${key} in table ${tableName} ${JSON.stringify(compatible)}`);
                }
            }
            value = compatible.value;
        }

        dataToInsert[key] = value === undefined ? null : value;
    }

    if (columnsToAdd.length > 0) {
        const promises = columnsToAdd.map((column) => {
            // once again need to alter this to use the helper function generateColumnSql
            const alterSql = `ALTER TABLE ${tableName} ADD COLUMN ${generateColumnSql(column.newType, column.columnName)}`;
            fs.appendFileSync("migrations.txt", alterSql + "\n");
            return connection.query(alterSql);
        });

        await Promise.all(promises);

        columnsToAdd.forEach((column) => {
            tableDefinition.columns[column.columnName] = column.newType;
        });
    }

    if (columnsToModify.length > 0) {
        const promises = columnsToModify.map((column) => {
            // once again need to alter this to use the helper function generateColumnSql
            const alterSql = `ALTER TABLE ${tableName} MODIFY COLUMN ${generateColumnSql(column.newType, column.columnName)}`;
            console.log(alterSql);
            fs.appendFileSync("migrations.txt", alterSql + "\n");
            return connection.query(alterSql);
        });

        await Promise.all(promises);

        columnsToModify.forEach((column) => {
            tableDefinition.columns[column.columnName] = column.newType;
        });
    }


    // Check for foreign keys
    for (const columnName of Object.keys(data)) {
        let referencedTable = columnName[0].toUpperCase() + columnName.slice(1);
        if (dbDefinition[referencedTable] && !tableDefinition.foreignKeys[columnName]) {
            const foreignKeyName = `fk_${tableName}_${columnName}`;
            const createForeignKeySql = `ALTER TABLE ${tableName} ADD CONSTRAINT ${foreignKeyName} FOREIGN KEY (${columnName}) REFERENCES ${referencedTable} (id)`;
            console.log(createForeignKeySql)
            await connection.query(createForeignKeySql);
            fs.appendFileSync("migrations.txt", createForeignKeySql + "\n");

            dbDefinition[tableName].foreignKeys[columnName] = {
                foreignKeyName,
                references: {
                    table: referencedTable,
                    column: "id"
                }
            };
        }
    }


    return;
}



export async function updateCache(connection) {
    const [tables] = await connection.query("SHOW TABLES");
    const promises = tables.map(async (table) => {
        const tableName = Object.values(table)[0] as string;
        const [columns] = await connection.query(
            `SHOW FULL COLUMNS FROM ${tableName}`
        );
        const [indexes] = await connection.query(`SHOW INDEX FROM ${tableName}`);
        const [foreignKeys] = await connection.query(
            `SHOW CREATE TABLE ${tableName}`
        );

        dbDefinition[tableName] = {
            columns: {},
            indexes: {},
            foreignKeys: {},
        };

        columns.forEach((column) => {
            const typeInfo = column.Type.match(/(\w+)\((.+)\)/);
            const type = typeInfo ? typeInfo[1].toUpperCase() : column.Type.toUpperCase();
            const typeDetails = typeInfo ? typeInfo[2].split(',') : [];

            const columnDefinition: ColumnDefinition = {
                type: type as ColumnDefinition["type"],
                notNull: column.Null === "NO",
                autoIncrement: column.Extra.includes("auto_increment"),
            };

            if (typeDetails.length > 0) {
                if (type === "ENUM") {
                    columnDefinition.enumValues = typeDetails.map(value => value.replace(/'/g, ''));
                } else if (type === "DECIMAL") {
                    columnDefinition.decimalTotalDigits = parseInt(typeDetails[0], 10);
                    columnDefinition.decimalFractionalDigits = parseInt(typeDetails[1], 10);
                } else {
                    columnDefinition.length = parseInt(typeDetails[0], 10);
                }
            }

            dbDefinition[tableName].columns[column.Field] = columnDefinition;
        });

        indexes.forEach((index) => {
            if (!dbDefinition[tableName].indexes[index.Key_name]) {
                dbDefinition[tableName].indexes[index.Key_name] = {
                    unique: index.Non_unique === 0,
                    columns: [],
                };
            }
            dbDefinition[tableName].indexes[index.Key_name].columns.push(
                index.Column_name
            );
        });

        const foreignKeyRegex = /CONSTRAINT\s+`([^`]+)`\s+FOREIGN KEY\s+\(`([^`]+)`\)\s+REFERENCES\s+`([^`]+)`\s+\(`([^`]+)`\)/g;
        let match;
        while (
            (match = foreignKeyRegex.exec(foreignKeys[0]["Create Table"])) !== null
        ) {
            const foreignKeyName = match[1];
            const foreignColumn = match[2];
            const referencedTable = match[3];
            const referencedColumn = match[4];

            dbDefinition[tableName].foreignKeys[foreignColumn] = {
                foreignKeyName,
                references: {
                    table: referencedTable,
                    column: referencedColumn,
                },
            };
        }
    });

    await Promise.all(promises);
}


// async function updateCache(connection) {
//     const [tables] = await connection.query("SHOW TABLES");
//     const promises = tables.map(async (table) => {
//         const tableName = Object.values(table)[0] as string;
//         const [columns] = await connection.query(
//             `SHOW FULL COLUMNS FROM ${tableName}`
//         );
//         const [indexes] = await connection.query(`SHOW INDEX FROM ${tableName}`);
//         const [foreignKeys] = await connection.query(
//             `SHOW CREATE TABLE ${tableName}`
//         );
//         // console.log(foreignKeys)

//         dbDefinition[tableName] = {
//             columns: {},
//             indexes: {},
//             foreignKeys: {},
//         };

//         columns.forEach((column) => {
//             const typeInfo = column.Type.match(/(\w+)\((.+)\)/);
//             const type = typeInfo ? typeInfo[1].toUpperCase() : column.Type.toUpperCase();
//             const typeDetails = typeInfo ? typeInfo[2].split(',') : [];

//             const columnDefinition: ColumnDefinition = {
//                 type: type as ColumnDefinition["type"],
//                 notNull: column.Null === "NO",
//                 autoIncrement: column.Extra.includes("auto_increment"),
//             };

//             if (typeDetails.length > 0) {
//                 if (type === "ENUM") {
//                     columnDefinition.enumValues = typeDetails.map(value => value.replace(/'/g, ''));
//                 } else if (type === "DECIMAL") {
//                     columnDefinition.decimalTotalDigits = parseInt(typeDetails[0], 10);
//                     columnDefinition.decimalFractionalDigits = parseInt(typeDetails[1], 10);
//                 } else {
//                     columnDefinition.length = parseInt(typeDetails[0], 10);
//                 }
//             }

//             dbDefinition[tableName].columns[column.Field] = columnDefinition;
//         });

//         indexes.forEach((index) => {
//             if (!dbDefinition[tableName].indexes[index.Key_name]) {
//                 dbDefinition[tableName].indexes[index.Key_name] = {
//                     unique: index.Non_unique === 0,
//                     columns: [],
//                 };
//             }
//             dbDefinition[tableName].indexes[index.Key_name].columns.push(
//                 index.Column_name
//             );
//         });

//         const foreignKeyRegex = /CONSTRAINT\s+`([^`]+)`\s+FOREIGN KEY\s+\(`([^`]+)`\)\s+REFERENCES\s+`([^`]+)`\s+\(`([^`]+)`\)/g;
//         let match;
//         while (
//             (match = foreignKeyRegex.exec(foreignKeys[0]["Create Table"])) !== null
//         ) {
//             dbDefinition[tableName].foreignKeys[match[1]] = {
//                 column: match[2],
//                 references: {
//                     table: match[3],
//                     column: match[4],
//                 },
//             };
//         }
//     });

//     await Promise.all(promises);
// }


function isTypeCompatible(value, columnDefinition) {
    let isCompatible = false;
    let mustModifyTo = null;

    if (value === null || value === undefined) {
        isCompatible = !columnDefinition.notNull;
        value = null;
    } else if (columnDefinition.type === "JSON") {
        isCompatible = true;
        value = JSON.stringify(value);
    } else if (columnDefinition.type === "DATE") {
        isCompatible = /^\d{4}-\d{2}-\d{2}$/.test(value);
    } else if (columnDefinition.type === "DATETIME") {
        isCompatible = /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:Z|\+\d{2}:\d{2})?)?$/.test(value);
    } else if (columnDefinition.type === "TINYINT") {
        isCompatible = (typeof value === "boolean") || value === 0 || value === 1;
    } else if (columnDefinition.type === "VARCHAR" || columnDefinition.type === "TEXT") {
        const valueLength = value.length;
        if (columnDefinition.maxLength && valueLength > columnDefinition.maxLength) {
            mustModifyTo = {
                ...columnDefinition,
                type: valueLength <= 255 ? "VARCHAR" : "TEXT",
                maxLength: valueLength,
            };
        } else {
            isCompatible = true;
        }
    } else if (!isNaN(Number(value))) {
        const numberValue = Number(value);

        const decimalTotalDigits = Math.max(Math.floor(Math.log10(Math.abs(numberValue))) + 1, 1);
        const decimalFractionalDigits = Math.max((numberValue.toString().split('.')[1] || '').length, 0);

        // if it's got decimal digits, it's a decimal
        if (decimalFractionalDigits > 0) {
            // if it's not a decimal type, need to convert
            if (columnDefinition.type !== "DECIMAL") {
                mustModifyTo = {
                    ...columnDefinition,
                    type: "DECIMAL",
                    decimalTotalDigits: decimalFractionalDigits + 18,
                    decimalFractionalDigits,
                };
            } else {
                // if it is a decimal type, check if it's compatible
                const currentTotalDigits = columnDefinition.decimalTotalDigits || 0;
                const currentFractionalDigits = columnDefinition.decimalFractionalDigits || 0;

                if (decimalTotalDigits > currentTotalDigits || decimalFractionalDigits > currentFractionalDigits) {

                    mustModifyTo = {
                        ...columnDefinition,
                        decimalTotalDigits: Math.max(decimalTotalDigits, currentTotalDigits),
                        decimalFractionalDigits: Math.max(decimalFractionalDigits, currentFractionalDigits),
                    };
                } else {
                    isCompatible = true;
                }
            }
        } else if (columnDefinition.type === "DECIMAL") {
            const currentTotalDigits = columnDefinition.decimalTotalDigits || 0;
            const currentFractionalDigits = columnDefinition.decimalFractionalDigits || 0;

            if (decimalTotalDigits > currentTotalDigits || decimalFractionalDigits > currentFractionalDigits) {
                mustModifyTo = {
                    ...columnDefinition,
                    decimalTotalDigits: Math.max(decimalTotalDigits, currentTotalDigits),
                    decimalFractionalDigits: Math.max(decimalFractionalDigits, currentFractionalDigits),
                };
            } else {
                isCompatible = true;
            }
        } else {
            isCompatible = (
                columnDefinition.type === "BIGINT" ||
                columnDefinition.type === "INT" ||
                columnDefinition.type === "SMALLINT" ||
                columnDefinition.type === "MEDIUMINT" ||
                columnDefinition.type === "FLOAT" ||
                columnDefinition.type === "DOUBLE"
            );

            if (!isCompatible) {
                mustModifyTo = {
                    ...columnDefinition,
                    type: "DECIMAL",
                    decimalTotalDigits,
                    decimalFractionalDigits,
                };
            }
        }
    } else if (value instanceof Date) {
        isCompatible = columnDefinition.type === "TIMESTAMP";
    }

    return {
        value,
        isCompatible,
        mustModifyTo,
    };
}


function determineColumnType(value, key?): ColumnDefinition {
    const valueType = typeof value;
    let columnDefinition: ColumnDefinition;

    if (key === "id") {
        columnDefinition = { type: "BIGINT", notNull: true, autoIncrement: true };
    }
    console.log("value type is", valueType);
    if (valueType === "number") {
        if (value % 1 === 0) {
            columnDefinition = { type: "BIGINT", notNull: false };
        } else {
            columnDefinition = {
                type: "DECIMAL",
                decimalTotalDigits: 20,
                decimalFractionalDigits: 10,
                notNull: false,
            };
        }
    } else if (valueType === "string") {
        if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            columnDefinition = { type: "DATE", notNull: false };
        } else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:Z|\+\d{2}:\d{2})?$/.test(value)) {
            columnDefinition = { type: "DATETIME", notNull: false };
        } else if (value.length <= 255) {
            columnDefinition = { type: "VARCHAR", length: 255, notNull: false };
        } else if (value.length <= 65535) {
            columnDefinition = { type: "TEXT", notNull: false };
        } else if (value.length <= 16777215) {
            columnDefinition = { type: "MEDIUMTEXT", notNull: false };
        } else {
            columnDefinition = { type: "LONGTEXT", notNull: false };
        }
    } else if (valueType === "boolean") {
        columnDefinition = { type: "TINYINT", length: 1, notNull: false };
    } else if (value instanceof Date) {
        columnDefinition = { type: "DATETIME", notNull: false };
    } else if (Array.isArray(value)) {
        if (value.every((v) => typeof v === "string")) {
            columnDefinition = {
                type: "ENUM",
                enumValues: value,
                notNull: false,
            };
        } else {
            throw new Error("Array must contain only strings for ENUM type");
        }
    } else if (value === null) {
        columnDefinition = { type: "TEXT", notNull: false };
    } else {
        columnDefinition = { type: "JSON" }
        // throw new Error(`Unsupported data type: ${valueType}`);
    }

    return columnDefinition;
}

function generateColumnSql(columnDefinition: ColumnDefinition, columnName: string): string {
    let sql = `${columnName}`;
    if (columnName === "id") {
        sql += " BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY";
    } else if (columnName === "created" || columnName === "updated" || columnName === "createdBy" || columnName === "updatedBy") {
        sql += " BIGINT";
    } else {
        sql += ` ${columnDefinition.type}`;
        if (columnDefinition.type === "VARCHAR" || columnDefinition.type === "ENUM") {
            sql += `(${columnDefinition.length})`;
        } else if (columnDefinition.type === "DECIMAL" || columnDefinition.type === "FLOAT" || columnDefinition.type === "DOUBLE") {
            sql += `(${columnDefinition.decimalTotalDigits},${columnDefinition.decimalFractionalDigits})`;
        }
        if (columnDefinition.notNull) {
            sql += " NOT NULL";
        }
        if (columnDefinition.autoIncrement) {
            sql += " AUTO_INCREMENT";
        }
        if (columnDefinition.enumValues && columnDefinition.enumValues.length > 0) {
            sql += `(${columnDefinition.enumValues.map((value) => `"${value}"`).join(",")})`;
        }
    }
    return sql;
}


function getForeignKeys(sql: string) {
    let inQuotes = false;
    let foreignKeys: ForeignKey[] = [];
    for (var i = 0; i < sql.length; ++i) {
        var char = sql[i];
        if (char === "'") {
            if (inQuotes) {
                if (sql[i - 1] !== "\\") {
                    inQuotes = false;
                }
            } else {
                inQuotes = true;
            }
        }
        if (inQuotes)
            continue;

        let joinMatch = sql.slice(i).match(/^JOIN\s*(\w+?)\s+ON\s+(\w+?)\.(\w+?)\s*=\s*(\w+)\.(\w+)/i);
        if (joinMatch) {
            let [, tableName, table1, column1, table2, column2] = joinMatch;
            foreignKeys.push({
                tableName: table1,
                column: column1,
                references: {
                    table: table2,
                    column: column2,
                },
            });

            foreignKeys.push({
                tableName: table2,
                column: column2,
                references: {
                    table: table1,
                    column: column1,
                },
            });

            i += joinMatch[0].length;
        }
    }
    return foreignKeys;
}

function ensureForeignKeysExist(connection, tableDefinition: TableDefinition, foreignKeys: ForeignKey[]) {
    let promises = [];
    for (let foreignKey of foreignKeys) {
        if (!tableDefinition.foreignKeys[foreignKey.column]) {
            const alterSql = `ALTER TABLE ${foreignKey.tableName} ADD FOREIGN KEY (${foreignKey.column}) REFERENCES ${foreignKey.references.table}(${foreignKey.references.column})`;
            console.log(alterSql);
            fs.appendFileSync("migrations.txt", alterSql + "\n");
            promises.push(connection.query(alterSql));
        }
    }
    return Promise.all(promises);
}



type ForeignKey = {
    tableName: string;
    column: string;
    references: {
        table: string;
        column: string;
    };
};

async function main() {

    let results = getForeignKeys(`SELECT 
    orders.order_id, 
    customers.customer_name, 
    orders.order_date, 
    order_items.product_name, 
    order_items.quantity,
    total_sales.total_sales_per_item
  FROM orders
  INNER JOIN customers ON orders.customer_id = customers.id
  INNER JOIN order_items ON orders.order_id = order_items.order_id
  INNER JOIN (
    SELECT 
      product_name, 
      SUM(quantity * price) AS total_sales_per_item
    FROM order_items
    GROUP BY product_name
  ) AS total_sales ON order_items.product_name = total_sales.product_name
  WHERE orders.order_date BETWEEN '2021-01-01' AND '2021-12-31'
  ORDER BY orders.order_date DESC;`);
    let connection = db

    await updateCache(connection);

    // console.log("cache is", dbDefinition);
    // await checkAndAlterTable(connection, "User", {
    //     id: 1,
    //     created: Date.now(),
    //     updated: Date.now(),
    //     createdBy: null,
    //     updatedBy: null,
    //     email: "bob@jones.com",
    //     password: "password",
    //     firstName: "Bob",
    //     lastName: "Jones",
    //     role: "admin",
    //     birthDay: "1990-01-01",
    //     netWorth: 1000000.13432094829034802398,
    //     currentCash: 50.23,
    //     isCool: true,
    // });

    await checkAndAlterTable(connection, "TransactionC", {
        id: 1,
        created: Date.now(),
        updated: Date.now(),
        createdBy: null,
        updatedBy: null,
        user: 1,
        transactiona: 1,
        type: "deposit",
        amount: 100.23,
        date: "2021-01-01",
    });

    connection.end();
}