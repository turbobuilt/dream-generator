// Step-by-step plan:
// 1. Define the ShareContact class
// 2. Extend this class from the global.DbObject
// 3. Add five class properties (firstName, lastName, email, authenticatedUser, sent) to it
// 4. Write the save() method which overrides the method from the base class. It should save the ShareContact instances to DB.

import { DbObject } from "../lib/db";


export class ShareContact extends DbObject {
  firstName: string;
  lastName: string;
  email: string;
  authenticatedUser: number;
  sent: boolean;

  async save(): Promise<ShareContact> {
    // Create a row data object
    const rowData = {
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      authenticatedUser: this.authenticatedUser,
      sent: this.sent
    };

    // Check if this is a new record
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