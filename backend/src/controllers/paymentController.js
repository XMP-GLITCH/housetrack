const { Payment, Tenant, Room, Receipt, Property, sequelize } = require('../models');
const { initiatePayment, verifyWebhookSignature } = require('../utils/notchpay');
const { generateReceiptNumber } = require('../utils/receiptNumber');

const getPayments = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;

    const where = { landlord_id: req.user.id };
    if (req.query.status) where.payment_status = req.query.status;
    if (req.query.month) where.rent_month = req.query.month;

    const { count, rows } = await Payment.findAndCountAll({
      where,
      include: [{ model: Tenant }, { model: Room, include: [Property] }],
      distinct: true,
      limit,
      offset,
      order: [['created_at', 'DESC']],
    });

    res.json({ success: true, data: rows, meta: { total: count, page, limit, pages: Math.ceil(count / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch payments' });
  }
};

const getTenantPayments = async (req, res) => {
  try {
    const { tenantId } = req.params;
    
    // Authorization check
    if (req.user.role === 'tenant') {
      const currentTenant = await Tenant.findOne({ where: { user_id: req.user.id } });
      if (!currentTenant || currentTenant.id != tenantId) {
        return res.status(403).json({ success: false, error: 'Forbidden' });
      }
    } else if (req.user.role === 'landlord') {
      const tenant = await Tenant.findOne({ where: { id: tenantId, landlord_id: req.user.id } });
      if (!tenant) {
        return res.status(404).json({ success: false, error: 'Tenant not found' });
      }
    }

    const payments = await Payment.findAll({
      where: { tenant_id: tenantId },
      include: [{ model: Room, include: [Property] }, { model: Receipt }]
    });

    res.json({ success: true, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch tenant payments' });
  }
};

const initiateRentPayment = async (req, res) => {
  try {
    const { tenant_id, room_id, rent_month, amount } = req.body;

    if (!tenant_id || !room_id || !rent_month || !amount) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }
    if (Number(amount) <= 0) {
      return res.status(400).json({ success: false, error: 'Amount must be greater than zero' });
    }

    if (!/^\d{4}-\d{2}$/.test(rent_month)) {
      return res.status(400).json({ success: false, error: 'rent_month must be in YYYY-MM format' });
    }

    const tenant = await Tenant.findByPk(tenant_id);
    if (!tenant) return res.status(404).json({ success: false, error: 'Tenant not found' });

    if (req.user.role === 'tenant' && tenant.user_id !== req.user.id) {
       return res.status(403).json({ success: false, error: 'Forbidden' });
    }
    if (req.user.role === 'landlord' && tenant.landlord_id !== req.user.id) {
       return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    const callbackUrl = `${process.env.CLIENT_URL}/payment/success`;
    const webhookUrl = `${process.env.API_BASE_URL || `http://${req.headers.host}/api/v1`}/payments/webhook`;
    const description = `Rent payment - ${rent_month} - Tenant ${tenant_id}`;

    // Re-use an existing pending record only if the amount and room still match.
    // If the tenant was moved to a different room the old record is stale — update it.
    const existingPayment = await Payment.findOne({
      where: { tenant_id, rent_month, notchpay_status: 'pending' }
    });

    if (existingPayment) {
      const amountChanged = Number(existingPayment.rent_amount) !== Number(amount);
      const roomChanged   = String(existingPayment.room_id) !== String(room_id);

      if (amountChanged || roomChanged) {
        existingPayment.room_id     = room_id;
        existingPayment.rent_amount = Number(amount);
        existingPayment.balance     = Number(amount);
        await existingPayment.save();
      }

      const notchpayRes = await initiatePayment(Number(amount), tenant.email || 'no-email@housetrack.com', description, existingPayment.notchpay_reference, callbackUrl, webhookUrl);
      const paymentUrl = notchpayRes?.authorization_url;
      if (paymentUrl) {
        return res.json({ success: true, data: { payment_url: paymentUrl, reference: existingPayment.notchpay_reference } });
      }
      // No URL returned — do not fall through to create a duplicate row
      return res.status(502).json({ success: false, error: 'Payment provider returned no payment link. Please try again.' });
    }

    const reference = `HRMS-PAY-${Date.now()}-${tenant_id}`;

    // Call Notchpay FIRST — only persist the Payment row if we get a valid URL back.
    // Creating the row first would orphan it if the external call fails.
    const notchpayRes = await initiatePayment(Number(amount), tenant.email || 'no-email@housetrack.com', description, reference, callbackUrl, webhookUrl);
    const paymentUrl = notchpayRes?.authorization_url;

    if (!paymentUrl) {
      return res.status(502).json({ success: false, error: 'Failed to get payment link from Notchpay' });
    }

    await Payment.create({
      tenant_id,
      room_id,
      landlord_id: tenant.landlord_id,
      rent_month,
      rent_amount: amount,
      amount_paid: 0,
      balance: amount,
      payment_status: 'unpaid',
      payment_date: new Date(),
      notchpay_reference: reference,
      notchpay_status: 'pending'
    });

    res.json({ success: true, data: { payment_url: paymentUrl, reference } });

  } catch (error) {
    console.error('initiateRentPayment error:', error.message);
    res.status(500).json({ success: false, error: error.message || 'Failed to initiate payment' });
  }
};

const handleWebhook = async (req, res) => {
  try {
    const isValid = verifyWebhookSignature(req);
    if (!isValid) {
      return res.status(401).json({ success: false, error: 'Invalid webhook signature' });
    }

    // req.body is a raw Buffer (express.raw middleware) — parse it here
    const payload = Buffer.isBuffer(req.body) ? JSON.parse(req.body.toString()) : req.body;
    const eventType = payload.event;

    if (eventType === 'payment.complete' && payload.data && payload.data.status === 'complete') {
      const reference = payload.data.reference;
      const amountPaid = payload.data.amount;

      const payment = await Payment.findOne({ where: { notchpay_reference: reference } });

      if (!payment) {
        console.warn('Webhook received for unknown reference:', reference);
        return res.status(200).send('OK');
      }

      if (payment.notchpay_status !== 'complete') {
        const totalPaid = Number(amountPaid);
        let balance = Number(payment.rent_amount) - totalPaid;
        if (balance < 0) balance = 0;

        let status = 'unpaid';
        if (balance === 0) status = 'paid';
        else if (totalPaid > 0) status = 'part_payment';

        // Atomic: update payment + create receipt in one transaction so a crash
        // between the two writes cannot leave the receipt permanently missing.
        await sequelize.transaction(async (t) => {
          payment.amount_paid = totalPaid;
          payment.balance = balance;
          payment.payment_status = status;
          payment.notchpay_status = 'complete';
          await payment.save({ transaction: t });

          const receiptExists = await Receipt.findOne({ where: { payment_id: payment.id }, transaction: t });
          if (!receiptExists && totalPaid > 0) {
            await Receipt.create({
              payment_id: payment.id,
              receipt_number: generateReceiptNumber(),
              generated_at: new Date()
            }, { transaction: t });
          }
        });
      }
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).send('Internal Server Error');
  }
};

const recordManualPayment = async (req, res) => {
  try {
    const { tenant_id, room_id, rent_month, amount_paid, notes } = req.body;

    if (!tenant_id || !room_id || !rent_month || !amount_paid) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }
    if (!/^\d{4}-\d{2}$/.test(rent_month)) {
      return res.status(400).json({ success: false, error: 'rent_month must be in YYYY-MM format' });
    }

    const tenant = await Tenant.findOne({ where: { id: tenant_id, landlord_id: req.user.id } });
    if (!tenant) return res.status(404).json({ success: false, error: 'Tenant not found' });

    const room = await Room.findByPk(room_id);
    if (!room) return res.status(404).json({ success: false, error: 'Room not found' });

    const paid = Number(amount_paid);
    const rentAmount = Number(room.rent_amount);
    const balance = Math.max(0, rentAmount - paid);
    const status = balance === 0 ? 'paid' : paid > 0 ? 'part_payment' : 'unpaid';

    // Check if there's an existing payment record for this month
    let payment = await Payment.findOne({ where: { tenant_id, rent_month } });

    if (payment) {
      payment.amount_paid = paid;
      payment.balance = balance;
      payment.payment_status = status;
      payment.payment_date = new Date();
      payment.notchpay_status = 'manual';
      await payment.save();
    } else {
      payment = await Payment.create({
        tenant_id,
        room_id,
        landlord_id: req.user.id,
        rent_month,
        rent_amount: rentAmount,
        amount_paid: paid,
        balance,
        payment_status: status,
        payment_date: new Date(),
        notchpay_reference: `MANUAL-${Date.now()}-${tenant_id}`,
        notchpay_status: 'manual',
      });
    }

    // Auto-generate receipt for paid or part-paid
    if (paid > 0) {
      const receiptExists = await Receipt.findOne({ where: { payment_id: payment.id } });
      if (!receiptExists) {
        await Receipt.create({
          payment_id: payment.id,
          receipt_number: generateReceiptNumber(),
          generated_at: new Date(),
        });
      }
    }

    res.json({ success: true, data: payment, message: 'Payment recorded successfully' });
  } catch (error) {
    console.error('Manual payment error:', error);
    res.status(500).json({ success: false, error: 'Failed to record payment' });
  }
};

module.exports = {
  getPayments,
  getTenantPayments,
  initiateRentPayment,
  recordManualPayment,
  handleWebhook
};
