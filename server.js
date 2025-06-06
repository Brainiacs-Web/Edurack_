// server.js

require('dotenv').config();
const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const path     = require('path');

mongoose.set('strictQuery', false);

const authRoutes     = require('./routes/auth');
const contactRoutes  = require('./routes/contacts');
const userRoutes     = require('./routes/users');
const questionRoutes = require('./routes/questions');
const paymentRoutes  = require('./routes/paymentRoutes');

const app = express();

// ✅ Enable CORS for all origins (dev + prod)
app.use(cors()); // 🔥 ALLOWS ALL ORIGINS

app.use(express.json());

// ✅ Serve static frontend files from /public
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Default route to serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ✅ MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ✅ API Routes
app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/users', userRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/payment', paymentRoutes);

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
