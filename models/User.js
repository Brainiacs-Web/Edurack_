// backend/models/User.js

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userID: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  studentClass: {
    type: String,
    enum: ['11th', '12th', 'Dropper'],
    required: true
  },
  exam: {
    type: String,
    enum: ['JEE', 'NEET'],
    required: true
  },
  state: {
    type: String,
    required: true,
    trim: true
  },
  photoURL: {
    type: String,
    default: null
  },
  dateOfBirth: {
    type: String, // or Date if you prefer
    default: ''
  },
  bio: {
    type: String,
    default: ''
  },
  school: {
    type: String,
    default: ''
  },
  examTarget: {
    type: String, // e.g. 'neet' or 'jee'
    default: ''
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  googleSignIn: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { collection: 'User Data' });

module.exports = mongoose.model('User', userSchema);
