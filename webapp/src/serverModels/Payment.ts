export class Payment {
    id?: number;
    iosTransactionId?: string;
    androidTransactionId?: string;
    stripePaymentIntentId?: string;
    productId?: string;
    androidOrderId?: string;
    androidToken?: string;
    authenticatedUser?: number;
    credits?: number;
    amount?: number;
    isMonthlyBill?: number | boolean;
    isProration?: number | boolean;
}
