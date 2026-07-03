const axios = require('axios');
const crypto = require('crypto');

const NOTCHPAY_API_URL = 'https://api.notchpay.co';

const initiatePayment = async (amount, email, description, reference, callbackUrl, webhookUrl) => {
  try {
    const response = await axios.post(`${NOTCHPAY_API_URL}/payments`, {
      amount: Number(amount),
      currency: 'XAF',
      email,
      description,
      reference,
      callback: callbackUrl,
      webhook: webhookUrl
    }, {
      headers: {
        'Authorization': process.env.NOTCHPAY_PUBLIC_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    });

    return response.data;
  } catch (error) {
    const detail = error.response?.data;
    console.error('Notchpay Error:', JSON.stringify(detail || error.message));
    const msg = detail?.message || detail?.error || 'Failed to initiate Notchpay payment';
    throw new Error(msg);
  }
};

const verifyWebhookSignature = (req) => {
  const notchpayHash = req.headers['x-notchpay-hash'];
  const secret = process.env.NOTCHPAY_SECRET_HASH;

  if (!notchpayHash || !secret || secret === 'your_notchpay_secret_hash') return false;

  try {
    // Use the raw body buffer (captured by express.raw) so the HMAC matches
    // Notchpay's signature exactly — re-serializing a parsed object changes byte order.
    const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from(JSON.stringify(req.body));
    const hmac = crypto.createHmac('sha256', secret);
    const digest = hmac.update(rawBody).digest('hex');
    const a = Buffer.from(digest, 'hex');
    const b = Buffer.from(notchpayHash, 'hex');
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
};

module.exports = {
  initiatePayment,
  verifyWebhookSignature
};
