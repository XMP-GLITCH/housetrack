// Run: node scripts/test-notchpay.js
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const axios = require('axios');

const key = process.env.NOTCHPAY_PUBLIC_KEY;
console.log('Key prefix:', key?.substring(0, 20), '...');

async function test(baseUrl, authHeader, label) {
  try {
    const res = await axios.post(`${baseUrl}/payments`, {
      amount: 100,
      currency: 'XAF',
      email: 'test@example.com',
      description: 'Test payment',
      reference: `TEST-${Date.now()}`,
      callback: 'http://localhost:5173/payment/success',
    }, {
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    });
    console.log(`\n✓ [${label}] SUCCESS:`, JSON.stringify(res.data).substring(0, 200));
  } catch (err) {
    const d = err.response?.data;
    console.log(`\n✗ [${label}] HTTP ${err.response?.status}: ${JSON.stringify(d)}`);
  }
}

(async () => {
  // Try 1: api.notchpay.co with plain key
  await test('https://api.notchpay.co', key, 'api.notchpay.co / plain key');
  // Try 2: api.notchpay.co with Bearer key
  await test('https://api.notchpay.co', `Bearer ${key}`, 'api.notchpay.co / Bearer key');
  // Try 3: sandbox.notchpay.co with plain key
  await test('https://sandbox.notchpay.co', key, 'sandbox.notchpay.co / plain key');
  // Try 4: sandbox.notchpay.co with Bearer key
  await test('https://sandbox.notchpay.co', `Bearer ${key}`, 'sandbox.notchpay.co / Bearer key');
})();
