const { randomBytes } = require('crypto');

const generateReceiptNumber = () => {
  const unique = randomBytes(4).toString('hex').toUpperCase();
  return `HRMS-${unique}`;
};

module.exports = { generateReceiptNumber };
