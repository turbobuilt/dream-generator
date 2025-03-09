//     "create table PaymentAttempt": `CREATE TABLE PaymentAttempt (id BIGINT PRIMARY KEY AUTO_INCREMENT, created BIGINT DEFAULT NULL, updated BIGINT DEFAULT NULL, createdBy BIGINT DEFAULT NULL, updatedBy BIGINT DEFAULT NULL, authenticatedUser BIGINT, FOREIGN KEY (authenticatedUser) REFERENCES AuthenticatedUser(id), amount INT, stripePaymentIntentId VARCHAR(255), status VARCHAR(255)`

import { DbObject } from "../lib/db";

export class PaymentAttempt extends DbObject {
    authenticatedUser: number;
    amount: number;
    stripePaymentIntentId: string;
    status: string;
    error: string;
}