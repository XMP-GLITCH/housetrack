const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Payment = sequelize.define('payment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  tenant_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  room_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  landlord_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  rent_month: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  rent_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  amount_paid: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  balance: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  payment_status: {
    type: DataTypes.ENUM('unpaid', 'part_payment', 'paid', 'overdue'),
    allowNull: false,
  },
  payment_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  notchpay_reference: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  notchpay_status: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
}, {
  underscored: true,
  timestamps: true,
});

module.exports = Payment;
