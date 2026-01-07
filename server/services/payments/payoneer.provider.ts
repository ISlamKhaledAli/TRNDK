import { IPayoutProvider, PayoutDetails } from './payment.provider.interface';

export class PayoneerProvider implements IPayoutProvider {
  private isEnabled: boolean;
  private env: string;

  constructor() {
    this.isEnabled = process.env.PAYONEER_ENABLED === 'true';
    this.env = process.env.PAYONEER_ENV || 'sandbox';
  }

  async validateRecipient(details: PayoutDetails): Promise<boolean> {
    // In a real scenario, we might call Payoneer API to check if the payee exists
    if (!details.email) return false;
    // Simple mock validation
    return details.email.includes('@');
  }

  async createPayout(amount: number, currency: string, recipient: PayoutDetails, referenceId: string): Promise<string> {
    if (!this.isEnabled) {
      throw new Error('Payoneer integration is disabled');
    }

    console.log(`[PayoneerStub] Creating payout of ${amount/100} ${currency} to ${recipient.email} (Ref: ${referenceId})`);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Allow simulating failures in sandbox
    if (this.env === 'sandbox' && recipient.email === 'fail@payoneer.com') {
      throw new Error('Mock Payoneer payout failed');
    }

    // Return a mock transaction ID
    return `payoneer_tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async getPayoutStatus(transactionId: string): Promise<'PENDING' | 'COMPLETED' | 'FAILED'> {
    // Mock status check
    return 'PENDING';
  }
}
