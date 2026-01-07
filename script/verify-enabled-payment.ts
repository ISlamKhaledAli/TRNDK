
// using native fetch

const API_BASE = 'http://localhost:5000/api/v1';

async function verifyPaymentEnabled() {
    try {
        // 1. Need a token. Register/Login first.
        const email = `test.check.${Date.now()}@example.com`;
        const regRes = await fetch(`${API_BASE}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Check User', email, password: 'Password123!', role: 'customer' })
        });
        
        if (!regRes.ok) throw new Error(`Registration failed: ${await regRes.text()}`);
        const setCookie = regRes.headers.get('set-cookie');
        const cookieHeader = setCookie?.split(';')[0];
        
        // 2. Create Order
        const checkoutRes = await fetch(`${API_BASE}/orders/checkout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Cookie': cookieHeader! },
            body: JSON.stringify({
                items: [{ serviceId: 7, quantity: 1000, link: 'http://foo.com', price: 1999900 }], // Use ID 7 which we know exists
                paymentMethod: 'payoneer'
            })
        });
        const checkoutJson = await checkoutRes.json() as any;
        if (!checkoutRes.ok) throw new Error(`Checkout failed: ${JSON.stringify(checkoutJson)}`);
        
        const { data: orders } = checkoutJson;
        const transactionId = orders[0].transactionId;

        // 3. Create Payment - This is where "Payoneer is disabled" would happen
        const paymentRes = await fetch(`${API_BASE}/payments/payoneer/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Cookie': cookieHeader! },
            body: JSON.stringify({ transactionId })
        });

        const text = await paymentRes.text();
        if (text.includes("Payoneer is disabled")) {
             console.error('❌ FAILED: Gateway says Payoneer is DISABLED (Stale instance?)');
             process.exit(1);
        } else if (paymentRes.ok) {
             console.log('✅ SUCCESS: Payment Gateway accepted the request.');
        } else {
             console.log('⚠️ Error but not disabled:', text);
        }

    } catch (e) {
        console.error('Test Error:', e);
        process.exit(1);
    }
}
verifyPaymentEnabled();
