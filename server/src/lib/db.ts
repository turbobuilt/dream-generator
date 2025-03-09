// npx tsc --declaration db.ts

import * as mysql from "mysql2/promise"
import { checkAndAlterTable, updateCache } from "./dbinsert";
import { readFileSync } from "fs";
import { DbCon } from "./db_old";


var con: mysql.Pool = null;

function shouldAlterTable() {
    return true;
}

export async function connectDb(projectId) {
    let values = {} as { [key: string]: string };
    try {
        let dbCreds = readFileSync("../../dbcred", "utf8").split("\n");
        for (let line of dbCreds) {
            let [key, value] = line.split("=");
            values[key] = value;
        }
    } catch {
        values = process.env;
    }
    process.env.MYSQL_DB = process.env.MYSQL_DB || values[`db_${projectId}`]
    process.env.MYSQL_HOST = process.env.MYSQL_HOST || values[`db_host_${projectId}`] || '127.0.0.1'
    process.env.MYSQL_USER = process.env.MYSQL_USER || values[`db_user_${projectId}`]
    process.env.MYSQL_PASSWORD = process.env.MYSQL_PASSWORD || values[`db_password_${projectId}`]
    console.log("host is", process.env.MYSQL_HOST, process.env.MYSQL_USER, process.env.MYSQL_PASSWORD, process.env.MYSQL_DB)
    console.log()

    // create a proxy.  Every time .query is called, check if the connection is disconnected.  If it is, reconnect.
    let ssl = null;
    if (process.env.MYSQL_HOST != "127.0.0.1") {
        console.log("using ssl for mysql");
        ssl = {
            ca: readFileSync("server.pem"),
        };
    }
    con = await mysql.createPool({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DB,
        connectionLimit: 3,
        idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0,
        ssl: ssl,
        typeCast: function (field, next) {
            if (field.type == "DECIMAL") {
                var value = field.string();
                return (value === null) ? null : Number(value);
            }
            return next();
        }
        // debug: true
    });

    // con = new Proxy({}, {
    //     get: function (target, name) {
    //         if (name === "query") {
    //             return async function (...args: any[]) {
    //                 try {
    //                     let result = await internalCon.query(...args);
    //                     console.log(result);
    //                     return result;
    //                 } catch (err) {
    //                     if (err.code === "PROTOCOL_CONNECTION_LOST") {
    //                         console.log("reconnecting")
    //                         internalCon = await mysql.createConnection({
    //                             host: process.env.MYSQL_HOST,
    //                             user: process.env.MYSQL_USER,
    //                             password: process.env.MYSQL_PASSWORD,
    //                             database: process.env.MYSQL_DB,
    //                         });
    //                         return await (await internalCon).query(...args);
    //                     } else {
    //                         throw err;
    //                     }
    //                 }
    //             }
    //         } else {
    //             return internalCon[name];
    //         }
    //     }
    // });

    if (shouldAlterTable()) {
        await updateCache(con);
    }
}

// create a proxy that will return con if it exists, otherwise it will throw an error
export const db = new Proxy({}, {
    get: function (target, name) {
        if (con) {
            return con[name];
        } else {
            throw new Error("Database connection not initialized");
        }
    }
}) as {
    query: (query: string, values?: any) => Promise<any>,
    format: (query: string, values: any) => string,
}

export async function transaction(queries: (conn: mysql.PoolConnection) => Promise<any>) {
    try {
        var conn = await con.getConnection();
        await conn.beginTransaction();
        await queries(conn);
        await conn.commit();
    } catch (err) {
        console.error("Error in transaction", err)
        try {
            await conn.rollback();
        } catch (err2) {
            console.error("Error - rollback failed", err2);
            throw err2;
        }
        throw err;
    } finally {
        try {
            conn.release();
        } catch (err) {
            console.error("error ending connection", err)
        }
    }
}

// export const db = ;

export class DbObject {
    id?: number;
    created?: number;
    updated?: number;
    createdBy?: number;
    updatedBy?: number;

    constructor(input?: number | any) {
        if (typeof input === "number") {
            this.get(input);
        } else if (typeof input === "object") {
            Object.assign(this, input);
        }
        return this;
    }

    save?(connection?): Promise<DbObject> {
        if (this.id) {
            return this.update(null, connection);
        } else {
            return this.insert(null, connection);
        }
    }

    static from<T extends DbObject>(this: new (...args: any[]) => T, obj: any) {
        let item = new this();
        Object.assign(item, obj);
        return item as T;
    }

    static async queryFetch<T extends DbObject>(this: new (...args: any[]) => T, query: string, values: any[] = []) {
        let [[result]] = await db.query(query, values);
        let item = new this(result);
        return item as T;
    }

    static async fetchById<T extends DbObject>(this: new (...args: any[]) => T, id: number) {
        let query = `SELECT * FROM ${this.name} WHERE id = ? LIMIT 1`;
        let [[result]] = await db.query(query, [id]);
        let item = new this(result);
        return item as T;
    }

    static async queryFetchAll<T extends DbObject>(this: new (...args: any[]) => T, query: string, values: any[] = []) {
        let [result] = await db.query(query, values);
        let items = [];
        for (let item of result) {
            items.push(new this(item));
        }
        return items as T[];
    }

    static getAll(page: number = 0, perPage?: number) {
        page = parseInt(page as any);
        perPage = parseInt(perPage as any) || null;
        let query = `SELECT * FROM ${this.constructor.name} ORDER BY created`;
        if (page && perPage) {
            query += " LIMIT ?, ?";
        }

        return db.query(query, [page * perPage, perPage]);
    }

    async get?(id: number) {
        this.id = id;
        const query = `SELECT * FROM ${this.constructor.name} WHERE id = ? LIMIT 1`;

        let [[item]] = await db.query(query, [id]);
        Object.assign(this, item);
        return item;
    }

    async update?(updatedBy?: number, connection?: DbCon) {
        const now = Date.now();
        this.updated = now;
        this.updatedBy = updatedBy;
        let obj = this;
        obj = this.fixInputs(obj);
        const keys = Object.keys(obj);
        const values = Object.values(obj);

        // for(let i = 0; i < values.length; ++i) {
        //     if(values[i] == undefined) {
        //         values[i] = null;
        //     } else if (typeof values[i] === "object") {
        //         values[i] = JSON.stringify(values[i]);
        //     }
        // }

        // if (shouldAlterTable()) {
        //     await checkAndAlterTable(db, this.constructor.name, this)
        // }

        const query = `UPDATE ${this.constructor.name} SET ${keys.map(key => key + " = ?").join(", ")} WHERE id = ?`;
        console.log(db.format(query, [...values, this.id]));
        let result = await (connection || db).query(query, [...values, this.id]);
        return result;
    }

    delete?() {
        const query = `DELETE FROM ${this.constructor.name} WHERE id = ?`;
        return db.query(query, [this.id]);
    }

    static async delete?(id) {
        const query = `DELETE FROM ${this.name} WHERE id = ?`;
        let result = await db.query(query, [id]);
    }

    fixInputs?(values) {
        for (let key in values) {
            if (values[key] === undefined || values[key] === null || values[key] === "null" || values[key] === "undefined") {
                values[key] = null;
            } else if (typeof values[key] === "object") {
                values[key] = JSON.stringify(values[key]);
            } else if (typeof values[key] === "boolean") {
                values[key] = values[key] ? 1 : 0;
            }
        }
        return values;
    }

    async insert?(createdBy?: number, connection?: DbCon) {
        let obj = this;
        const now = Date.now();
        obj.created = now;
        obj.updated = now;
        obj.createdBy = createdBy;
        obj.updatedBy = createdBy;
        obj = this.fixInputs(obj);
        const keys = Object.keys(obj);
        const values = Object.values(obj);
        const placeholders = values.map(() => "?");
        const query = `INSERT INTO ${this.constructor.name} (${keys.join(", ")}) VALUES (${placeholders.join(", ")})`;

        console.log('inserting', query, values)
        let result = await (connection || db).query(query, values);
        obj.id = result[0].insertId;
        return obj;
    }
}