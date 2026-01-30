import { IPaymentGateway, PaymentIntent } from './payment-gateway.interface';

export class PayoneerGateway implements IPaymentGateway {
  private isEnabled: boolean;
  private env: string;
  private mode: string;

  constructor() {
    this.isEnabled = process.env.PAYONEER_ENABLED === 'true';
    this.env = process.env.PAYONEER_ENV || 'sandbox';
    this.mode = process.env.PAYONEER_MODE || 'mock';
  }

  async createPaymentIntent(amount: number, currency: string, orderId: string, userDetails?: any): Promise<PaymentIntent> {
    // Initiation NEVER fails in mock mode, regardless of isEnabled setting
    if (!this.isEnabled && this.mode !== 'mock') {
      throw new Error('Payoneer is disabled');
    }

    console.log(`[PayoneerGateway] Creating payment intent for Order ${orderId}: ${amount/100} ${currency}`);
    
    const transactionId = `pay_tx_${orderId}_${Date.now()}`;
    
    // Determine the redirect URL based on mode
    let redirectUrl: string;
    
    if (this.mode === 'mock') {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5000';
        redirectUrl = `${frontendUrl}/mock-payoneer/checkout?txId=${transactionId}&refId=${orderId}&amount=${amount}`;
    } else {
        // In a real integration, this would return a Payoneer Checkout Page URL from their API
        // For now, let's keep a placeholder or implement real API call here if we had credentials
        redirectUrl = `https://checkout.payoneer.com/stubs/payment?id=${transactionId}`;
    }

    return {
      url: redirectUrl,
      transactionId,
      data: {
        provider: 'payoneer',
        env: this.env,
        mode: this.mode
      }
    };
  }

  async verifyPayment(transactionId: string): Promise<boolean> {
    console.log(`[PayoneerGateway] Verifying transaction ${transactionId}`);
    // Mock verification: assume all tx starting with 'pay_tx' are valid mock transactions
    return transactionId.startsWith('pay_tx_');
  }
}
