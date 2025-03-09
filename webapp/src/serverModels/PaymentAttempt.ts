export class PaymentAttempt {
    authenticatedUser?: number;
    amount?: number;
    stripePaymentIntentId?: string;
    status?: string;
    error?: string;
}
