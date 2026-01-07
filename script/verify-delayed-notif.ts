
const API_BASE = 'http://localhost:5000/api/v1';

async function verifyDelayedNotifications() {
    try {
        console.log('🚀 Starting Delayed Notifications Verification...');
        
        // 1. Register User
        const email = `test.notif.${Date.now()}@example.com`;
        const regRes = await fetch(`${API_BASE}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Notif User', email, password: 'Password123!', role: 'customer' })
        });
        const cookieHeader = regRes.headers.get('set-cookie')?.split(';')[0];

        // 2. Checkout with Payoneer
        console.log('2. performing Checkout (Payoneer)...');
        const checkoutRes = await fetch(`${API_BASE}/orders/checkout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Cookie': cookieHeader! },
            body: JSON.stringify({
                items: [{ serviceId: 7, quantity: 1, link: 'http://foo.com', price: 1999900 }],
                paymentMethod: 'payoneer'
            })
        });
        const { data: orders } = await checkoutRes.json() as any;
        const orderId = orders[0].id;
        const transactionId = orders[0].transactionId;

        // 3. Verify No Notifications yet
        console.log('3. Checking if notification exists before payment...');
        const notifResBefore = await fetch(`${API_BASE}/notifications`, {
            headers: { 'Cookie': cookieHeader! }
        });
        const { data: notifsBefore } = await notifResBefore.json() as any;
        
        const orderNotif = notifsBefore.find((n: any) => n.orderId === orderId);
        if (orderNotif) {
             throw new Error('❌ FAILED: Notification found BEFORE payment!');
        }
        console.log('✅ Success: No notification found yet.');

        // 4. Simulate Payment Callback
        console.log('4. Simulating Payment Callback...');
        const callbackRes = await fetch(`${API_BASE}/payments/payoneer/callback?txId=pay_tx_TEST&refId=${transactionId}&status=success`, {
             headers: { 'Cookie': cookieHeader! }
        });

        // 5. Verify Notification now exists
        console.log('5. Checking if notification exists AFTER payment...');
        const notifResAfter = await fetch(`${API_BASE}/notifications`, {
            headers: { 'Cookie': cookieHeader! }
        });
        const { data: notifsAfter } = await notifResAfter.json() as any;
        
        const orderNotifAfter = notifsAfter.find((n: any) => n.orderId === orderId);
        if (!orderNotifAfter) {
             throw new Error('❌ FAILED: Notification NOT found after payment!');
        }
        console.log('🏆 VERIFIED: Order notification delayed until payment completion.');

    } catch (e) {
        console.error('Test Error:', e);
        process.exit(1);
    }
}
verifyDelayedNotifications();
