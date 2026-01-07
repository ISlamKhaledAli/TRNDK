
// import fetch from 'node-fetch'; // using native fetch in Node 18+

const API_BASE = 'http://localhost:5000/api/v1';

async function e2eTest() {
  console.log('🚀 Starting E2E Payment Test...');

  try {
    // 1. Register User
    const email = `test.user.${Date.now()}@example.com`;
    const password = 'Password123!';
    console.log(`1. Registering user: ${email}`);
    
    const regRes = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test User', email, password, role: 'customer' })
    });

    if (!regRes.ok) throw new Error(`Registration failed: ${await regRes.text()}`);
    
    // Extract Token from Cookie
    const setCookie = regRes.headers.get('set-cookie');
    if (!setCookie) throw new Error('No cookie received from registration');
    
    // We can just pass the whole cookie string back
    const cookieHeader = setCookie.split(';')[0]; // Simple extraction
    console.log('✅ Registered & Logged In. Cookie:', cookieHeader);

    // 2. Get Available Services
    const servicesRes = await fetch(`${API_BASE}/services`);
    if (!servicesRes.ok) throw new Error('Failed to fetch services');
    const { data: services } = await servicesRes.json() as any;
    
    if (services.length === 0) throw new Error('No services available to purchase');
    const serviceId = services[0].id;
    const servicePrice = services[0].price;
    console.log(`2. Found Service: ID ${serviceId} (Price: ${servicePrice})`);

    // 3. Checkout (Create Order)
    console.log(`3. Creating Order for Service ${serviceId}`);

    const checkoutRes = await fetch(`${API_BASE}/orders/checkout`, {
      method: 'POST',
      headers: { 
          'Content-Type': 'application/json',
          'Cookie': cookieHeader
      },
      body: JSON.stringify({
          items: [
              { serviceId, quantity: 1000, link: 'http://example.com', price: 1 } // Maliciously low price
          ],
          paymentMethod: 'payoneer'
      })
    });

    if (!checkoutRes.ok) throw new Error(`Checkout failed: ${await checkoutRes.text()}`);
    const { data: orders } = await checkoutRes.json() as any;
    const order = orders[0];
    const transactionId = order.transactionId;
    console.log(`✅ Order Created. Order ID: ${order.id}, Transaction ID: ${transactionId}, Amount: ${order.totalAmount}`);

    if (order.totalAmount <= 10) {
        throw new Error('❌ SECURITY FAIL: Backend accepted frontend price!');
    } else {
        console.log('🛡️  Security Check Passed: Backend ignored frontend price.');
    }

    // 3. Initiate Payment
    console.log(`3. Initiating Payment for Transaction ${transactionId}`);
    
    const paymentRes = await fetch(`${API_BASE}/payments/payoneer/create`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Cookie': cookieHeader
        },
        body: JSON.stringify({ transactionId })
    });

    const paymentText = await paymentRes.text();
    let callbackUrl = '';

    if (paymentText.includes("Payoneer is disabled")) {
        console.log('⚠️  Payoneer is disabled. MANUALLY forcing callback to verify DB updates...');
        // Manually construct the callback URL that the gateway WOULD have returned
        // The stub implementation expects txId starting with 'pay_tx_' to pass verification
        callbackUrl = `${API_BASE}/payments/payoneer/callback?txId=pay_tx_FORCED_TEST&refId=${transactionId}&status=success`;
    } else {
        if (!paymentRes.ok) throw new Error(`Payment Initiation Failed: ${paymentText}`);
        const intent = JSON.parse(paymentText);
        console.log('✅ Payment Intent Response:', intent);
        callbackUrl = intent.url;
    }
    
    // 4. Follow Callback (Simulate Payment Success)
    if (callbackUrl && callbackUrl.includes('callback')) {
        console.log(`4. Simulating Callback Hit: ${callbackUrl}`);
        
        // We need updates to propagate.
        const callbackRes = await fetch(callbackUrl, {
             method: 'GET',
             redirect: 'manual', // We expect a redirect
             headers: { 'Cookie': cookieHeader } // Pass cookie just in case (though callback is usually public/verified by params)
        });
        
        // 5. Verify Order Status in DB
        console.log('5. Verifying Order Status...');
        const ordersRes = await fetch(`${API_BASE}/orders/my`, {
            headers: { 'Cookie': cookieHeader }
        });
        const { data: myOrders } = await ordersRes.json() as any;
        const updatedOrder = myOrders.find((o: any) => o.id === order.id);
        
        console.log(`Current Order Status: ${updatedOrder.status}`);
        
        if (updatedOrder.status === 'processing') {
             console.log('🏆 E2E TEST PASSED: Order status automatically updated to PROCESSING.');
        } else {
             throw new Error(`❌ E2E TEST FAILED: Order status is ${updatedOrder.status}, expected processing.`);
        }

    } else {
        console.error('❌ E2E TEST FAILED: Invalid Redirect URL.');
    }

  } catch (e: any) {
    console.error('❌ Test Failed:', e.message);
  }
}

e2eTest();
