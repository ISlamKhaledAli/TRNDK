
import { PayoneerProvider } from '../server/services/payments/payoneer.provider.js';

async function verifyPayoneerStub() {
  console.log('--- Verifying Payoneer Provider Stub ---');

  // 1. Initialize
  // Mock env vars for the test
  process.env.PAYONEER_ENABLED = 'true';
  process.env.PAYONEER_ENV = 'sandbox';

  const provider = new PayoneerProvider();
  console.log('Provider initialized.');

  // 2. Validate Recipient
  console.log('Testing validation...');
  const valid = await provider.validateRecipient({ email: 'test@example.com' });
  if (valid) console.log('✅ Validation passed for valid email');
  else console.error('❌ Validation failed for valid email');

  const invalid = await provider.validateRecipient({ email: '' });
  if (!invalid) console.log('✅ Validation passed for invalid email details');
  else console.error('❌ Validation failed (should be false) for empty details');

  // 3. Create Payout
  console.log('Testing payout creation...');
  try {
    const txId = await provider.createPayout(10000, 'USD', { email: 'test@example.com' }, 'REF-123');
    console.log(`✅ Payout created successfully. Transaction ID: ${txId}`);
  } catch (e: any) {
    console.error(`❌ Payout creation failed: ${e.message}`);
  }

  // 4. Test Mock Failure
  console.log('Testing mock failure scenario...');
  try {
    await provider.createPayout(5000, 'USD', { email: 'fail@payoneer.com' }, 'REF-FAIL');
    console.error('❌ Payout should have failed but succeeded.');
  } catch (e: any) {
    console.log(`✅ Payout failed as expected with message: ${e.message}`);
  }

  console.log('--- Verification Complete ---');
}

verifyPayoneerStub().catch(console.error);
