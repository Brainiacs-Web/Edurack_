const express = require('express');
const router = express.Router();
const {
  createOrder,
  verifyPayment
} = require('../controllers/paymentController');

// Create Razorpay order
router.post('/create-order', createOrder);

// Verify payment and store in DB
router.post('/verify-payment', verifyPayment);

module.exports = router;
