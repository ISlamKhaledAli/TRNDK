
export interface PaymentIntent {
  url: string;
  transactionId: string;
  data?: any;
}

export interface IPaymentGateway {
  /**
   * Create a payment intent/session.
   * Returns a URL to redirect the user to, or data to initialize a client-side SDK.
   */
  createPaymentIntent(amount: number, currency: string, orderId: string, userDetails?: any): Promise<PaymentIntent>;

  /**
   * Verify if a payment was successful.
   */
  verifyPayment(transactionId: string): Promise<boolean>;
}
