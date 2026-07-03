const { Receipt, Payment, Tenant, Room, Property } = require('../models');

const getReceipt = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findByPk(paymentId, {
      include: [
        { model: Tenant },
        { model: Room, include: [Property] }
      ]
    });

    if (!payment) {
      return res.status(404).json({ success: false, error: 'Payment not found' });
    }

    // Authorization
    if (req.user.role === 'tenant') {
      const currentTenant = await Tenant.findOne({
        where: { user_id: req.user.id, status: 'active' },
        order: [['id', 'DESC']],
      });
      if (!currentTenant || Number(currentTenant.id) !== Number(payment.tenant_id)) {
        return res.status(403).json({ success: false, error: 'Forbidden' });
      }
    } else if (req.user.role === 'landlord') {
      if (payment.landlord_id !== req.user.id) {
        return res.status(403).json({ success: false, error: 'Forbidden' });
      }
    }

    const receipt = await Receipt.findOne({ where: { payment_id: paymentId } });

    if (!receipt) {
      return res.status(404).json({ success: false, error: 'Receipt not found' });
    }

    res.json({ success: true, data: { receipt, payment } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch receipt' });
  }
};

module.exports = {
  getReceipt
};
