// write a database wrapper for node mysql. Use "@vlasky/mysql". Please connect to mysql and keep track of the connection pool
// I would like the class to work this way, but if you think of something better, please make a comment and do it the best way you think
// here is what it should have:
// 




import mysql, { OkPacket } from "@vlasky/mysql"
import * as crypto from "crypto";
import moment from "moment"
import baseX from "base-x";
import { bool, guid, json, text, validate, propertyInfo } from "./validation";
import { FastifyRequest } from "fastify";

//random int from -10 to 10

// nanoseconds since epoch adding in random time of 1 microsecond
const startTime = BigInt(Date.now() * 1_000_000 + crypto.randomInt(-1_000, 1_000));
const startHRTime = process.hrtime.bigint();

export function getNanosecondsSinceEpoch() {
    return startTime + (process.hrtime.bigint() - startHRTime);
}

function promisify(fn: Function) {
    return function (...args): Promise<any> {
        return new Promise((res, rej) => fn(...args, (err, result) => err ? rej(err) : res(result)))
    }
}

const randomFill = promisify(crypto.randomFill);

const NUM_BITS = 128;
const RANDOM_BYTES_SIZE = (NUM_BITS - 64) / 8
const BASE58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
const bs58 = baseX(BASE58);
export const maxChars = Math.ceil(NUM_BITS / Math.log2(BASE58.length));

const randomBytes = promisify(crypto.randomBytes);
const randomInt = promisify(crypto.randomInt);

export const toSnakeRegex = /[A-Z]|\d+/g;
export const toPascalRegex = /_[a-z]|_\d+/g;

export class Backup {
    guid?: string;
    createdAt?: string;
    updatedAt?: string;
    createdBy?: string;
    updatedBy?: string;

    @text(100) tableName?: string;
    @guid() itemGuid?: string;
    @json(50) data?: any;
    @text(30) documentUpdatedBy?: string;
    @bool() isDelete?: boolean;
}

export class DbCon {
    con: mysql.Connection;
    constructor(con: mysql.Connection) {
        this.con = con;
    }
    async query(sql: string, params: any[] = []): Promise<any[]> {
        return new Promise((res, rej) => this.con.query(sql, params, (err, data) => err ? rej(err) : res(data)));
    }
    async execute(sql: string, params: any[] = []): Promise<OkPacket> {
        return new Promise((res, rej) => this.con.query(sql, params, (err, data) => err ? rej(err) : res(data)));
    }
}

class MyPool {
    db: mysql.Connection;
    connectionSettings: mysql.ConnectionOptions;
    numConnections = 0;
    queryQueue = [];
    maxConnections = 130;
    queryTimeout = 5000;
    constructor(connectionSettings: mysql.ConnectionOptions) {
        this.connectionSettings = Object.assign(connectionSettings, {
            typeCast: function (field, next) {
                if (field.type === "JSON") {
                    return JSON.parse(field.string());
                } else {
                    return next();
                }
            },
            queryFormat(sql, values, stringifyObjects, timeZone) {
                if (Array.isArray(values)) {
                    for (var i = 0; i < values.length; ++i) {
                        if (values[i] && typeof values[i] === 'object') {
                            values[i] = JSON.stringify(values[i]);
                        }
                    }
                }
                return mysql.format(sql, values, stringifyObjects, timeZone);
            },
            // stringifyObjects: true,
            // debug: true
        });
    }
    static async createPool(connectionSettings: mysql.ConnectionOptions) {
        let pool = new MyPool(connectionSettings);
        return pool;
    }
    async getConnection() {
        try {
            var numAttempts = 0;
            while (this.numConnections > this.maxConnections) {
                await new Promise(resolve => setTimeout(resolve, 10));
                if (numAttempts++ > 1000) {
                    throw new Error("error getting connection to mysql.  Was not able to get an open connection in a reasonable amount of time");
                }
            }
            this.numConnections++;
            var connection = mysql.createConnection(this.connectionSettings);
            await new Promise((res, rej) => connection.connect(err => err ? rej(err) : res(null)))
            return connection;
        } catch (err) {
            this.numConnections--;
            console.error("error conecting mysql", err);
            throw err;
        }
    }
    async query(sql: any, values: any[] = []) {
        var connection = await this.getConnection();
        try {
            let results = await new Promise((res, rej) => connection.query(sql, values, (err, data) => err ? rej(err) : res(data)));
            try { await new Promise((res, rej) => connection.end(err => err ? rej(err) : res(null))); } catch (err) { console.error("error ending connection", err); try { connection.destroy(); } catch (err) { } }
            this.numConnections--;
            return [results];
        } catch (err) {
            try { await new Promise((res, rej) => connection.end(err => err ? rej(err) : res(null))); } catch (err) { console.error("error ending connection", err); try { connection.destroy(); } catch (err) { } }
            this.numConnections--;
            this.handleSqlError(err);
            throw err;
        }
    }
    handleSqlError(err) {
        if (!err)
            return err;
        if (err.code == "ER_DUP_ENTRY" || err.code == "ER_NO_DEFAULT_FOR_FIELD")
            err.error = err.sqlMessage;
        return err;
    }
    async execute(sql: any, values: any[] = []) {
        if (true || process.env.NODE_ENV === 'development')
            console.error(sql, values);
        var connection = await this.getConnection();
        try {
            let results = await new Promise((res, rej) => connection.query(sql, values, (err, data) => err ? rej(err) : res(data)));
            try { await new Promise((res, rej) => connection.end(err => err ? rej(err) : res(null))); } catch (err) { console.error("error ending connection", err); try { connection.destroy(); } catch (err) { } }
            this.numConnections--;
            return results;
        } catch (err) {
            try { await new Promise((res, rej) => connection.end(err => err ? rej(err) : res(null))); } catch (err) { console.error("error ending connection", err); try { connection.destroy(); } catch (err) { } }
            this.numConnections--;
            this.handleSqlError(err);
            throw err;
        }
    }
    async end() {
        if (this.db) {
            let db = this.db;
            this.db = null;
            try {
                await await new Promise((res, rej) => db.end(err => err ? rej(err) : res(null)))
            } catch (err) {
                console.error("Error ending db", err);
            }
        }
    }
}

export var db: MyPool; //mysql.Pool;

let closeDb = function () {
    try {
        if (db) {
            db.end()
            db = null;
        }
    } catch (err) {
        console.error(err)
    }
    process.exit(0);
};
process.on('SIGINT', closeDb);
process.on('SIGTERM', closeDb);
process.on("exit", closeDb);

export async function connect() {
    const dbConnectionSettings = {
        host: '127.0.0.1',
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
        connectionLimit: 15,
        dateStrings: true,
        // debug: true
    } as mysql.ConnectionOptions;
    db = await MyPool.createPool(dbConnectionSettings); // 
    let bobpoll = await mysql.createPool(dbConnectionSettings);
}

const characterArray = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const characters = {};
for (var i = 0; i < characterArray.length; ++i) {
    characters[i] = characterArray[i];
}


export async function createGuid() {
    var timestampBuffer = Buffer.alloc(8);
    timestampBuffer.writeBigUInt64BE(getNanosecondsSinceEpoch());
    var randomBytes = Buffer.alloc(RANDOM_BYTES_SIZE);
    await randomFill(randomBytes);
    var all = Buffer.concat([timestampBuffer, randomBytes])
    var allString = bs58.encode(all);
    var lengthDifference = maxChars - allString.length;
    var padding = "";
    for (var i = 0; i < lengthDifference; ++i) {
        padding += "0";
    }
    var final = padding + allString;
    console.log("created", final)
    return final;
}
export async function createRandomGuid() {
    var guidArray = [];
    for (var i = 0; i < 20; ++i) {
        var number = await randomInt(35) as number;
        guidArray.push(characters[number]);
    }
    var guid = guidArray.join("");
    return guid;
}

export async function transaction(queries: (con: DbCon) => Promise<any>) {
    try {
        var conn = await db.getConnection();
        await conn.beginTransaction();
        await queries(new DbCon(conn));
        await conn.commit();
        await new Promise((res, rej) => conn.end(err => err ? rej(err) : res(null)))
    } catch (err) {
        console.error("Error in transaction", err)
        try {
            await conn.rollback();
        } catch (err2) {
            console.error("Error - rollback failed", err2);
            await new Promise((res, rej) => conn.end(err => err ? rej(err) : res(null)))
            throw err2;
        }
        try {
            await new Promise((res, rej) => conn.end(err => err ? rej(err) : res(null)))
        } catch (err) {
            console.error("error ending connection", err)
        }
        throw err;
    } finally {
        db.numConnections--;
    }
}
export async function getItemByGuid(table: string, guid: any, className?: string, con?: DbCon, idInsteadofGuid?: boolean) {
    var query = "SELECT * FROM " + table + " WHERE guid=?";
    if (idInsteadofGuid)
        query = "SELECT * FROM " + table + " WHERE id=?";
    let values = [guid]
    let results = await (con || db).query(query, values);
    return normalizeAll(Array.isArray(results[0]) ? results[0] : results, className)[0] as any || null;
}

export function getWhereClause(conditions: any[][], params: any[], querystringData?: any, conjunction: "AND" | "OR" = "AND") {
    console.log(conditions);
    if (!conditions)
        return "";
    if (conjunction != "AND" && conjunction != "OR")
        throw new Error("Invalid conjunction.  Can only be AND or OR");
    if (typeof querystringData === 'object') {
        for (let key of querystringData) {
            conditions.push([key, "=", querystringData[key]]);
        }
    }
    let whereClause = "";
    for (let condition of conditions) {
        if (condition[0].toUpperCase() === "AND" || condition[0].toUpperCase() === "OR") {
            let clause = getWhereForLevel(condition, params);
            if (!clause)
                continue;
            if (!whereClause.length)
                whereClause += " WHERE (" + clause + ") ";
            else
                whereClause += " " + conjunction + " (" + clause + ") ";
            continue;
        }
        if ((condition[1].toUpperCase() == 'IS' || condition[1].toUpperCase() == 'IS NOT') && condition[2] === null) {

        } else if (!condition[2] || condition[2] === 'null' || condition[2] === 'undefined')
            continue;
        if (!whereClause.length)
            whereClause += " WHERE ";
        else
            whereClause += " " + conjunction + " ";

        if (condition[1].toUpperCase() == 'IS' && condition[2] === null) {
            whereClause += condition[0] + " " + condition[1] + " NULL";
        } else {
            whereClause += condition[0] + " " + condition[1] + " ?";
            params.push(condition[2]);
        }
    }
    return whereClause;
}

function getWhereForLevel(conditions: any[], params) {
    let conjunction = conditions.shift().toUpperCase();
    let clause = "";
    let numConditionsActive = 0;
    for (let condition of conditions) {
        let extraContent = ""
        if (condition[0].toUpperCase() === "AND" || condition[0].toUpperCase() === "OR") {
            let subClause = getWhereForLevel(condition, params);
            if (!clause.length)
                clause += " " + subClause;
            else
                clause += " " + conjunction + " " + subClause;
            continue;
        }
        if (condition[1] && condition[1].toUpperCase() == 'IS') {
            extraContent = condition[0] + " " + condition[1] + " " + condition[2];
        } else if (!condition[2] || condition[2] === 'null' || condition[2] === 'undefined')
            continue;
        else {
            extraContent = condition[0] + " " + condition[1] + " ?";
            params.push(condition[2]);
        }
        numConditionsActive++;
        if (clause.length)
            clause += " " + conjunction + " ";
        clause += extraContent;
    }
    if (numConditionsActive > 1)
        clause = "(" + clause + ")";
    return clause;
}

export function normalizeAll(items: any[] | OkPacket, className: string) {
    let validationInfo = propertyInfo[className];
    if (!items || !Array.isArray(items))
        return [];
    for (var i = 0; i < items.length; ++i) {
        let item = items[i];
        // var item of items as any[]) {
        // if(item.data) {
        //     for(var key in item.data) {
        //         item[key] = item.data[key]
        //     }
        //     delete item.data;
        // }
        for (var key in item) {
            if (key === "guid" || Buffer.isBuffer(item[key]))
                item[key] = item[key]?.toString("utf-8") || item[key];
            var camel = toCamel(key);
            if (validationInfo && validationInfo.properties[camel]) {
                if (validationInfo.properties[camel].type === 'dollar' && item[key] !== null)
                    item[key] = item[key] / 100;
                if (validationInfo.properties[camel].type === 'bool') {
                    item[key] = item[key] == null ? null : !!item[key];
                }
                if (validationInfo.properties[camel].type === 'number' && item[key]) {
                    item[key] = parseFloat(item[key]);
                }
            }
            if (camel !== key) {
                item[camel] = item[key];
                delete item[key];
            }
        }
        items[i] = Object.assign({}, item);
    }
    return items
}
export function normalize(item, className: string) {
    if (!item)
        return item;
    let validationInfo = propertyInfo[className];
    // if(item.data) {
    //     for(var key in item.data) {
    //         item[key] = item.data[key]
    //     }
    //     delete item.data;
    // }
    for (var key in item) {
        if (key == "guid" || Buffer.isBuffer(item[key]))
            item[key] = item[key].toString("utf-8");
        var camel = toCamel(key);
        if (validationInfo && validationInfo.properties[camel]) {
            if (validationInfo.properties[camel].type === 'dollar' && item[key] !== null)
                item[key] = item[key] / 100;
            if (validationInfo.properties[camel].type === 'bool')
                item[key] = item[key] == null ? null : !!item[key];
            if (validationInfo.properties[camel].type === 'number' && item[key]) {
                item[key] = parseFloat(item[key]);
            }
        }
        if (camel !== key) {
            item[camel] = item[key];
            delete item[key];
        }
    }
    return Object.assign({}, item);
}
export async function exec(query: string, parameters?: any[], con?: DbCon): Promise<any[]> {
    if (true || process.env.NODE_ENV === 'development')
        console.error(query, parameters);
    if (!query)
        throw new Error("query was not specified")

    var results = await (con || db).query(query, parameters) as mysql.RowDataPacket[][];
    return normalizeAll(results[0], null) as any;
}
export async function query(query: string, parameters?: any[], className?: string, con?: DbCon): Promise<any[]> {
    if (true || process.env.NODE_ENV === 'development') {
        // print query substituting ? with parameters
        var queryWithParams = query;
        if (parameters) {
            for (var i = 0; i < parameters.length; ++i) {
                queryWithParams = queryWithParams.replace("?", typeof parameters[i] == 'string' ? "'" + parameters[i] + "'" : parameters[i]);
            }
        }
        console.error(queryWithParams);
    }
    if (!query)
        throw new Error("query was not specified")
    var results = await (con || db).query(query, parameters) as mysql.RowDataPacket[][];
    return normalizeAll(Array.isArray(results[0]) ? results[0] : results, className) as any;
}

export async function queryNoLog(query: string, parameters?: any[], className?: string, con?: DbCon): Promise<any[]> {
    if (!query)
        throw new Error("query was not specified")
    var results = await (con || db).query(query, parameters) as mysql.RowDataPacket[][];
    return normalizeAll(Array.isArray(results[0]) ? results[0] : results, className) as any;
}

export async function joinQuery(query: string, parameters?: any[], className?: string) {
    if (!query)
        throw new Error("query was not specified")
    var results = await db.query({ sql: query, nestTables: true }, parameters) as mysql.RowDataPacket[][];
    for (var row of results[0] as any) {
        for (var key in row) {
            row[key] = normalize(row[key], className);
        }
    }
    return results[0];
}
export async function oneQuery(query: string, parameters?: any[], className?: string, con?: DbCon) {
    if (process.env.NODE_ENV === 'development')
        console.log(query, parameters);
    if (!query)
        throw new Error("query was not specified")
    var results = await (con || db).query(query, parameters) as mysql.RowDataPacket[][];
    return normalizeAll(Array.isArray(results[0]) ? results[0] : results, className)[0] as any;
}
export async function update(table: string, object: any, updatedBy: string, connection?: DbCon, previous?: any, noBackup?: boolean) {
    if (!object)
        return null;
    if (!object.guid)
        throw new Error("Error, no object guid was given.");
    var now = moment().format("YYYY-MM-DD HH:mm:ss");
    var createdAt = object.createdAt;
    delete object.createdAt;
    var previousObject = object;
    object = validate(table, object);
    object.createdAt = createdAt;
    object.updatedAt = now;
    object.updatedBy = updatedBy;

    var guid = object.guid;
    delete object.guid;

    var fields = [];
    var values = [];
    for (var field in object) {
        let sanitized = field.replace(/[^a-z_0-9]/gi, "")
            .slice(0, 50)
            .replace(toSnakeRegex, char => "_" + char.toLowerCase())

        fields.push(sanitized + "=?");
        values.push(object[field])
        if (object[field] === undefined)
            object[field] = null;
        // throw new Error("Field " + field + " is undefined");
    }
    values.push(guid);

    let query = `UPDATE ${table} SET ${fields.join(",")} WHERE guid=?`;
    if (process.env.NODE_ENV === "development")
        if (true || process.env.NODE_ENV === 'development') {
            // print query substituting ? with values
            var queryWithParams = query;
            if (values) {
                for (var i = 0; i < values.length; ++i) {
                    queryWithParams = queryWithParams.replace("?", typeof values[i] == 'string' ? "'" + values[i] + "'" : values[i]);
                }
            }
            console.error(queryWithParams);
        }
    if (!connection) {
        await transaction(async con => {
            if (!noBackup)
                await backupDocument(table, guid, updatedBy, con, previous);
            let result = await con.query(query, values);
            if (!result || (!(result as any).affectedRows && !result[0]?.affectedRows)) {
                console.log("no affected rows... inserting")
                // insert document
                await insert(table, previousObject, updatedBy, con);
            }
        })
    } else {
        if (!noBackup)
            await backupDocument(table, guid, updatedBy, connection, previous);
        let result = await connection.query(query, values);
        if (!result || (!(result as any).affectedRows && !result[0]?.affectedRows)) {
            console.log("no affected rows... inserting")
            // insert document
            await insert(table, previousObject, updatedBy, connection);
        }
    }
    db.execute(`DELETE FROM autosave WHERE item=? AND item_guid=? AND user=?`, [table, guid || 'new', updatedBy || null]);
    object.createdAt = createdAt;
    object.guid = guid;
    for (let key in object) {
        previousObject[toCamel(key)] = object[key]
    }
    let pascal = table[0].toUpperCase() + table.slice(1).replace(/_./g, char => char[1].toUpperCase());
    return normalize(previousObject, pascal);
    return previousObject;
}
export async function insert(table: string, object: any, createdBy: string, connection?: DbCon) {
    if (!object.guid)
        object.guid = await createGuid();
    var now = moment().format("YYYY-MM-DD HH:mm:ss");
    var previousObject = object;
    object = validate(table, object);
    object.createdAt = now;
    object.updatedAt = now;
    object.createdBy = createdBy;
    object.updatedBy = createdBy;

    var fields = [];
    var placeholders = [];
    var values = [];
    for (var field in object) {
        let sanitized = field.replace(/[^a-z_0-9]/gi, "")
            .slice(0, 50)
            .replace(toSnakeRegex, char => "_" + char.toLowerCase())

        fields.push(sanitized);
        placeholders.push("?")
        if (object[field] === undefined)
            object[field] = null;
        values.push(object[field])
        // throw new Error("Field " + field + " is undefined");
    }
    let query = `INSERT INTO ${table} (${fields.join(",")}) VALUES (${placeholders.join(",")})`;
    if (connection) {
        await connection.query(query, values);
    } else
        await db.query(query, values);
    db.query(`DELETE FROM autosave WHERE item=? AND item_guid=? AND user=?`, [table, object.guid || 'new', createdBy || null]);
    for (let key in object)
        previousObject[toCamel(key)] = object[key]
    let pascal = table[0].toUpperCase() + table.slice(1).replace(/_./g, char => char[1].toUpperCase());
    return normalize(previousObject, pascal);
}
export async function insertMany(table: string, objects: any, createdBy: string, connection?: DbCon) {
    let insertObjects = [];
    let fields = {};
    for (let object of objects) {
        if (!object.guid)
            object.guid = await createGuid();
        var now = moment().format("YYYY-MM-DD HH:mm:ss");
        object.createdAt = now;
        object.updatedAt = now;
        object.createdBy = createdBy;
        object.updatedBy = createdBy;
        console.log(object);
        object = validate(table, object);

        let insertObject = {};
        for (var field in object) {
            let sanitized = field.replace(/[^a-z_0-9]/gi, "")
                .slice(0, 50)
                .replace(toSnakeRegex, char => "_" + char.toLowerCase());

            if (object[field] === undefined)
                object[field] = null;

            insertObject[sanitized] = object[field];
            fields[sanitized] = true;
        }
        insertObjects.push(insertObject);
    }

    let fieldsArray = Object.keys(fields);
    let values = [];
    let placeholders = [];

    for (let insertObject of insertObjects) {
        let placeholdersForInsertObject = [];
        for (let field of fieldsArray) {
            values.push(insertObject[field]);
            placeholdersForInsertObject.push("?");
        }
        placeholders.push(`(${placeholdersForInsertObject.join(",")})`);
    }

    let query = `INSERT INTO ${table} (${fieldsArray.join(",")}) VALUES ${placeholders.join(",")}`;
    if (true || process.env.NODE_ENV === 'development') {
        // print query substituting ? with parameters
        var queryWithParams = query;
        if (values) {
            for (var i = 0; i < values.length; ++i) {
                queryWithParams = queryWithParams.replace("?", typeof values[i] == 'string' ? "'" + values[i] + "'" : values[i]);
            }
        }
        console.error(queryWithParams);
    }
    await (connection || db).query(query, values);
    // let pascal = table[0].toUpperCase() + table.slice(1).replace(/_./g, char => char[1].toUpperCase());
    return objects;
}
export async function deleteByGuid(table: string, guid: string, userId: string, connection?: DbCon, previous?: any) {
    if (!guid)
        throw new Error("guid is required");
    if (connection) {
        await backupDocument(table, guid, userId, connection, previous, false, true);
        let result = connection.query(`DELETE FROM ${table} WHERE guid=?`, [guid]);
        return result;
    } else {
        return await transaction(async (con) => {
            await backupDocument(table, guid, userId, con, previous, false, true);
            let result = await con.query(`DELETE FROM ${table} WHERE guid=?`, [guid]);
            return result;
        })
    }
}
export async function deleteByQuery(table: string, guid: string, userId: string, connection?: DbCon, previous?: any) {
    if (!guid)
        throw new Error("guid is required");
    if (connection) {
        await backupDocument(table, guid, userId, connection, previous, false, true);
        let result = connection.query(`DELETE FROM ${table} WHERE guid=?`, [guid]);
        return result;
    } else {
        return await transaction(async (con) => {
            await backupDocument(table, guid, userId, con, previous, false, true);
            let result = await con.query(`DELETE FROM ${table} WHERE guid=?`, [guid]);
            return result;
        })
    }
}

export async function backupDocument(table: string, guid: string, userId: string, connection: DbCon, oldDocument?: any, idInsteadofGuid?: boolean, isDelete?: boolean) {
    if (!table)
        throw new Error("table is required");
    if (!guid)
        throw new Error("guid is required");

    let tableEscaped = table.replace(/[^a-zA-Z0-9_]/g, () => "");
    let value = oldDocument || (await getItemByGuid(table, guid, undefined, undefined, idInsteadofGuid));
    if (!value)
        throw new Error("Previous version of document was not found. Aborting.");
    delete value.revisions;
    let backup: Backup = {
        tableName: tableEscaped,
        itemGuid: guid,
        data: value,
        documentUpdatedBy: value?.updatedBy,
        isDelete: isDelete,
    }
    await insert("backup", backup, userId, connection);
}

export function fixCase(object: any) {
    if (!object)
        return object;
    var item = {};
    for (var key in object) {
        var fixedKey = key.replace(toPascalRegex, str => str.slice(1).toUpperCase());
        item[fixedKey] = object[key];
    }
    return object;
}
export function fixCaseAll(items: any[]) {
    for (let item of items) {
        if (!item)
            continue;
        for (var key in item) {
            var fixedKey = key.replace(toPascalRegex, str => str.slice(1).toUpperCase());
            if (key !== fixedKey) {
                item[fixedKey] = item[key];
                delete item[key];
            }
        }
    }
    return items;
}
export function striphiddenFields(objectClass: Function, object: any) {
    for (var key in (objectClass as any).hiddenFields) {
        delete object[key];
    }
    return object;
}

export function getOrderAndPaginationQuery(req: FastifyRequest, tableName?: string) {
    let querystring = req.query as any;
    let page = parseInt(querystring.page) || 1;
    let perPage = parseInt(querystring.perPage) || 50;
    if (perPage > 500)
        perPage = 500;
    querystring.order = querystring.order || "-updatedAt";
    let orderBy = querystring.order[0] === '-' ? querystring.order.slice(1) : querystring.order;
    orderBy = toSnake(orderBy);
    let orderByDirection = querystring.order[0] === '-' ? "DESC" : "ASC";
    let orderByQuery = `ORDER BY ?? ${orderByDirection}`;
    let paginationQuery = `LIMIT ${perPage} OFFSET ${(page - 1) * perPage}`;
    return { orderByQuery, paginationQuery, orderByParams: [(tableName ? tableName + "." : "") + orderBy] }
}

export function toSnake(str) {
    return str.replace(toSnakeRegex, s => "_" + s.toLowerCase())
}
export function toCamel(str) {
    return str.replace(toPascalRegex, s => s.slice(1).toUpperCase())
}