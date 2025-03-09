// Plan:
// 1. Import the 'global' namespace to access the DbObject.
// 2. Declare the Transaction class extending global.DbObject.
// 3. Declare properties for this class: id, iosTransactionId, androidTransactionId, stripeTransactionId, productId.
// Note: No constructor, as it will be inherited from the DbObject.
// 4. Properties are not explicitly initialized and are expected to be populated by instances of the class.

import { DbObject } from "../lib/db";

export class Payment extends DbObject {
  id: number;
  iosTransactionId: string;
  androidTransactionId: string;
  stripePaymentIntentId: string;
  productId: string;
  androidOrderId: string;
  androidToken: string;
  authenticatedUser: number;
  credits: number;
  amount: number;
  isMonthlyBill: number|boolean;
  isProration: number|boolean;
}
