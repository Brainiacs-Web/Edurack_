// server.js

require('dotenv').config();
const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const path     = require('path');

// Suppress the strictQuery deprecation warning:
// (optional, but recommended)
mongoose.set('strictQuery', false);

const authRoutes     = require('./routes/auth');
const contactRoutes  = require('./routes/contacts');
const userRoutes     = require('./routes/users');
const questionRoutes = require('./routes/questions');
const paymentRoutes  = require('./routes/paymentRoutes');

const app = express();

// 1) Middleware
app.use(cors());
app.use(express.json());

// 2) Serve static files from backend/public/
app.use(express.static(path.join(__dirname, 'public')));

// 3) Root route serves index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 4) Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// 5) API routes
app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/users', userRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/payment', paymentRoutes);

// 6) Start server on port 5000 (if not overridden)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
