import { randomBytes } from "crypto";
import { DbObject } from "../lib/db";

export class AuthToken extends DbObject {
    token: string;
    authenticatedUser: number;

    async generate(userId: any): Promise<string> {
        const buffer = randomBytes(32); // Get 256 bits of random data
        this.token = buffer.toString('base64'); // Convert the random data to a base64 string
        this.authenticatedUser = userId;
        await this.save(); // Save the token
        return this.token; // Return the token
    }
}
