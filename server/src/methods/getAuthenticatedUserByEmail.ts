// typescript

/* 
Implementation plan: 
1. Import necessary modules.
2. Define an async function getUserByEmail taking as parameter a string for email address.
3. Inside this function, fetch the user from the database with the given email using global.db.query.
4. Destructure the first result as user. 
5. Return only the "name", "email", and "tokens" fields from the user.
*/

import { RowDataPacket } from 'mysql2/promise';

export async function getAuthenticatedUserByEmail(email: string): Promise<RowDataPacket | null> {
    const [[user]] : [RowDataPacket[]] = await global.db.query(`SELECT id, name, email, creditsRemaining, appleIdentifier, agreesToTerms FROM AuthenticatedUser WHERE email = ?`, [email]);
    if(user) {
        user.agreesToTerms = !!user.agreesToTerms;
    }
    return user;
}