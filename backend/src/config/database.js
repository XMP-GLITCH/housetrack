const { Sequelize } = require('sequelize');

const isProd = process.env.NODE_ENV === 'production';

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'mysql',
  logging: false,
  dialectOptions: isProd
    ? { ssl: { rejectUnauthorized: false } }
    : {},
});

module.exports = { sequelize };
