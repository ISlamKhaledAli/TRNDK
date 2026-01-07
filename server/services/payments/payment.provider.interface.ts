export interface PayoutDetails {
  email?: string;
  payeeId?: string;
  [key: string]: any;
}

export interface IPayoutProvider {
  /**
   * Validate if the recipient details are sufficient for this provider.
   */
  validateRecipient(details: PayoutDetails): Promise<boolean>;

  /**
   * Request a payout.
   * @returns transactionId from the provider
   */
  createPayout(amount: number, currency: string, recipient: PayoutDetails, referenceId: string): Promise<string>;

  /**
   * Check the status of a payout.
   */
  getPayoutStatus(transactionId: string): Promise<'PENDING' | 'COMPLETED' | 'FAILED'>;
}
