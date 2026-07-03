const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Room = sequelize.define('room', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  property_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  room_number: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  room_type: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  rent_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('available', 'occupied', 'maintenance'),
    allowNull: false,
    defaultValue: 'available',
  },
}, {
  underscored: true,
  timestamps: true,
});

module.exports = Room;
