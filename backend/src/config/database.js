const { Sequelize } = require('sequelize');

const url = process.env.DATABASE_URL || '';
const isRailway = url.includes('railway') || url.includes('rlwy.net');

const sequelize = new Sequelize(url, {
  dialect: 'mysql',
  logging: false,
  dialectOptions: isRailway
    ? { ssl: { rejectUnauthorized: false } }
    : {},
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

module.exports = { sequelize };
