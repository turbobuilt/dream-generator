import db from "./cmpdb";
import { DbObject } from "./db";


export class AuthToken extends DbObject {
    token?: string;
    user?: number;
    expires?: number;
}

export async function verifyToken(token: string): Promise<any> {
    let results = await db.query(`SELECT user.* FROM AuthToken 
    INNER JOIN user ON user.id = AuthToken.user 
    WHERE AuthToken.token = ? AND AuthToken.expires > ?`, [token, Date.now()]);

    return results[0][0];
}