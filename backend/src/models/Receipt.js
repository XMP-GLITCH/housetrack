const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Receipt = sequelize.define('receipt', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  payment_id: {
    type: DataTypes.INTEGER,
    unique: true,
    allowNull: false,
  },
  receipt_number: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false,
  },
  generated_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  underscored: true,
  timestamps: true,
});

module.exports = Receipt;
