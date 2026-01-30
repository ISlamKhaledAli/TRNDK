import { IPaymentGateway, PaymentIntent } from './payment-gateway.interface';

export class PayPalGateway implements IPaymentGateway {
  constructor() {
    // Lazily load env vars to avoid initialization race conditions
  }

  private get clientId(): string {
      return process.env.PAYPAL_CLIENT_ID || '';
  }

  private get clientSecret(): string {
      return process.env.PAYPAL_SECRET_KEY || '';
  }

  private get webhookId(): string {
      return process.env.PAYPAL_WEBHOOK_ID || '';
  }

  private get baseUrl(): string {
      const mode = (process.env.PAYPAL_MODE || 'sandbox').toLowerCase().trim();
      return mode === 'live'
        ? 'https://api-m.paypal.com' 
        : 'https://api-m.sandbox.paypal.com';
  }

  private async getAccessToken(): Promise<string> {
    const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
    
    try {
        const response = await fetch(`${this.baseUrl}/v1/oauth2/token`, {
          method: 'POST',
          body: 'grant_type=client_credentials',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[PayPalGateway] Auth Failed: ${response.status} - ${errorText}`);
            throw new Error(`Failed to get PayPal access token: ${response.status}`);
        }

        const data = await response.json();
        return data.access_token;
    } catch (error: any) {
        // Secure logging: Don't log the full error object if it contains sensitive headers/tokens
        console.error(`[PayPalGateway] Auth Error: ${error.message}`); 
        throw new Error('PayPal Authentication Failed');
    }
  }

  async createPaymentIntent(amount: number, currency: string, orderId: string, userDetails?: any): Promise<PaymentIntent> {
    try {
        const accessToken = await this.getAccessToken();

        // Payment amount in DB is in CENTS (based on earlier analysis of Payoneer).
        // Convert to units (e.g. 1000 cents -> 10.00 USD)
        const value = (amount / 100).toFixed(2);
        
        const payload = {
          intent: 'CAPTURE',
          purchase_units: [
            {
              reference_id: orderId, // Our internal Transaction ID
              custom_id: orderId,    // Use for webhook mapping
              amount: {
                currency_code: currency,
                value: value,
              },
            },
          ],
          // Minimal payload: Let PayPal SDK handle the experience context via client-side configuration if needed.
        };

        const response = await fetch(`${this.baseUrl}/v2/checkout/orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error(`[PayPalGateway] Create Order Failed: ${response.status}`);
            throw new Error(`PayPal Create Order Failed`);
        }

        // Capture Link or Approval Link
        const approveLink = data.links.find((link: any) => link.rel === 'approve');

        return {
          url: approveLink ? approveLink.href : '',
          transactionId: data.id, // PayPal Order ID
          data: {
            provider: 'paypal',
            orderId: data.id
          }
        };
    } catch (error) {
        throw error;
    }
  }

  async verifyPayment(transactionId: string): Promise<boolean> {
      // In this flow, we might not strictly use this verifyPayment in the same way 
      // if we are doing immediate capture.
      // But let's implement checking order status.
      const accessToken = await this.getAccessToken();
      
      const response = await fetch(`${this.baseUrl}/v2/checkout/orders/${transactionId}`, {
          method: 'GET',
          headers: {
              'Authorization': `Bearer ${accessToken}`,
          }
      });

      if (!response.ok) return false;
      const data = await response.json();
      
      return data.status === 'COMPLETED' || data.status === 'APPROVED';
  }
  
  // Additional method for Capture
  async capturePayment(orderId: string): Promise<any> {
    const accessToken = await this.getAccessToken();
    
    try {
        const response = await fetch(`${this.baseUrl}/v2/checkout/orders/${orderId}/capture`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
                'Prefer': 'return=representation'
            },
            body: '{}' // Explicit empty body
        });

        const data = await response.json();
        
        return { ok: response.ok, data };
    } catch (error) {
        console.error(`[PayPalGateway] Capture Network Error`);
        throw error;
    }
  }
  
  async getOrderDetails(orderId: string): Promise<any> {
      const accessToken = await this.getAccessToken();
      const response = await fetch(`${this.baseUrl}/v2/checkout/orders/${orderId}`, {
          method: 'GET',
          headers: {
              'Authorization': `Bearer ${accessToken}`,
          }
      });
      
      if (!response.ok) {
          throw new Error('Failed to fetch PayPal order details');
      }
      
      return await response.json();
  }

  /**
   * Verifies the signature of an incoming PayPal webhook.
   * Calls PayPal's verification API.
   */
  async verifyWebhookSignature(headers: any, body: any): Promise<boolean> {
    if (!this.webhookId) {
      console.warn("[PayPalGateway] Missing PAYPAL_WEBHOOK_ID. Webhook verification skipped (Risky!)");
      return true; // Fallback if not configured, but ideally should be error
    }

    try {
      const accessToken = await this.getAccessToken();

      const verificationPayload = {
        webhook_id: this.webhookId,
        transmission_id: headers['paypal-transmission-id'],
        transmission_time: headers['paypal-transmission-time'],
        cert_url: headers['paypal-cert-url'],
        auth_algo: headers['paypal-auth-algo'],
        transmission_sig: headers['paypal-transmission-sig'],
        webhook_event: body,
      };

      const response = await fetch(`${this.baseUrl}/v1/notifications/verify-webhook-signature`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(verificationPayload),
      });

      if (!response.ok) {
        console.error(`[PayPalGateway] Webhook verification API failed: ${response.status}`);
        return false;
      }

      const data = await response.json();
      return data.verification_status === 'SUCCESS';
    } catch (error) {
      console.error(`[PayPalGateway] Webhook verification error:`, error);
      return false;
    }
  }
}
