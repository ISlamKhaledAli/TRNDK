
const API = 'http://localhost:5000/api/v1/config';

async function check() {
    try {
        const res = await fetch(API);
        if (!res.ok) {
            console.error(`HTTP Error: ${res.status}`);
            process.exit(1);
        }
        const json = await res.json() as any;
        console.log('Config Response:', JSON.stringify(json, null, 2));
        
        if (json.data && json.data.payoneerEnabled === true) {
             console.log('✅ VERIFIED: Payoneer is enabled on the server.');
        } else {
             console.error('❌ FAILED: Payoneer is DISABLED.');
             process.exit(1);
        }
    } catch(e) {
        console.error('Failed to connect:', e);
        process.exit(1);
    }
}
check();
