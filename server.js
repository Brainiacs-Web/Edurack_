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

// 1) Middleware: Enable CORS only for your frontend URL
app.use(cors({
  origin: 'https://edurack.onrender.com',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

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

// 6) Start server on all network interfaces (0.0.0.0) and port from env or 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running and accessible at http://localhost:${PORT}`);
});
