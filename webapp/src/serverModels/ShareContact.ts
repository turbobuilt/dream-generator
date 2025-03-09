import { DbObject } from "./db";

export class ShareContact extends DbObject {
    firstName?: string;
    lastName?: string;
    email?: string;
    authenticatedUser?: number;
    sent?: boolean;

    async save() {
        const rowData = {
              firstName: this.firstName,
              lastName: this.lastName,
              email: this.email,
              authenticatedUser: this.authenticatedUser,
              sent: this.sent
            };
        if (!this.id) {
              // Insert new record
              const result = await global.db.query('INSERT INTO ShareContacts SET ?', [rowData]);
              this.id = result.insertId;
            } else {
              // Update existing record
              await global.db.query('UPDATE ShareContacts SET ? WHERE id = ?', [rowData, this.id]);
            }

        return this;
    }
}
