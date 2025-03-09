// express req, add authenticatedUser property to it

import { Request } from "express";

declare global {
    namespace Express {
        interface Request {
            authenticatedUser?: AuthenticatedUser;
        }
    }
}
 // add db (mysql2/promise) to global

import { Connection } from "mysql2/promise";
import { DbObject as obj } from "../../lib/db";

// process.env NODE_ENV 
declare global {
    namespace NodeJS {
        interface ProcessEnv {
            NODE_ENV: "development" | "production";
        }
    }
    // var DbObject: typeof obj;
    var db: {
        query: (string, any?) => Promise<any[][]> & Connection.query;
    };
}