
import { PayoneerGateway } from '../server/services/payments/payoneer-gateway.js';

// NOTE: This script tests the gateway class directly, but cannot test the FULL HARDENED FLOW
// because the hardened flow requires a valid Payment record in the database.
// To fully verify, we would need to create a payment record in the DB first.

async function verify() {
  console.log('--- Verifying Payoneer Checkout Gateway (Stub) ---');

  // Mock env
  process.env.PAYONEER_ENABLED = 'true';
  process.env.PAYONEER_ENV = 'sandbox';
  process.env.APP_URL = 'http://localhost:5000';

  const gateway = new PayoneerGateway();
  
  try {
    const amount = 5000; // 50.00 USD
    const currency = 'USD';
    const transactionId = 'TXN-TEST-123'; 

    console.log(`[Stub Check] Creating intent for ${amount} ${currency}...`);
    // This calls the gateway directly, bypassing the route hardening (which is where the security check lies).
    // The Gateway itself IS allowed to take amounts (internal trusted class).
    // The PROTECTION is in the ROUTE.
    
    const intent = await gateway.createPaymentIntent(amount, currency, transactionId);

    console.log('✅ Intent Created:', intent);
    
    if (intent.url.includes('callback') && intent.transactionId.startsWith('pay_tx_')) {
        console.log('✅ URL and Transaction ID format looks correct.');
    } else {
        console.error('❌ Unexpected response format');
    }

  } catch (e: any) {
    console.error('❌ Error:', e.message);
  }
}

verify().catch(console.error);
