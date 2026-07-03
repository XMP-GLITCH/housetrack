require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { sequelize } = require('./src/config/database');

// Import models to initialize associations
require('./src/models/index');

const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const propertyRoutes = require('./src/routes/propertyRoutes');
const roomRoutes = require('./src/routes/roomRoutes');
const tenantRoutes = require('./src/routes/tenantRoutes');
const paymentRoutes = require('./src/routes/paymentRoutes');
const receiptRoutes = require('./src/routes/receiptRoutes');
const complaintRoutes = require('./src/routes/complaintRoutes');
const reportRoutes = require('./src/routes/reportRoutes');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Strict limiter for registration only (brute-force protection)
const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { success: false, error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Routes
app.use('/api/v1/auth/register', registerLimiter);
app.use('/api/v1/auth', apiLimiter, authRoutes);
app.use('/api/v1/users', apiLimiter, userRoutes);
app.use('/api/v1/properties', apiLimiter, propertyRoutes);
app.use('/api/v1/rooms', apiLimiter, roomRoutes);
app.use('/api/v1/tenants', apiLimiter, tenantRoutes);
app.use('/api/v1/payments', apiLimiter, paymentRoutes);
app.use('/api/v1/receipts', apiLimiter, receiptRoutes);
app.use('/api/v1/complaints', apiLimiter, complaintRoutes);
app.use('/api/v1/reports', apiLimiter, reportRoutes);

app.get('/api/v1', (req, res) => {
  res.json({ success: true, message: 'HouseTrack API is running' });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Step 1: verify DB connection
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully.');
  } catch (error) {
    console.warn('⚠  Database connection failed:', error.message);
    console.warn('⚠  Starting server without database. API calls requiring DB will fail.');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📡 API base: http://localhost:${PORT}/api/v1`);
    });
    return;
  }

  // Step 2: sync schema — non-fatal, tables may already be correct
  try {
    await sequelize.sync({ alter: false });
    console.log('✅ Database schema ready.');
  } catch (syncErr) {
    console.warn('⚠  Schema sync skipped:', syncErr.message);
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 API base: http://localhost:${PORT}/api/v1`);
  });
};

startServer();
