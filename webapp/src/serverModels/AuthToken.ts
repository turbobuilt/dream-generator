import { DbObject } from "./db";

export class AuthToken extends DbObject {
    token?: string;
    authenticatedUser?: number;

    async generate(userId: any) {
        const buffer = randomBytes(32);
        this.token = buffer.toString('base64');
        this.authenticatedUser = userId;
        await this.save();
        return this.token;
    }
}
