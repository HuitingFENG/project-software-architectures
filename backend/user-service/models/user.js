// user-service/models/user.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String, // In a real app, you should hash passwords
  // Add other necessary fields
});

const User = mongoose.model('User', userSchema);

module.exports = User;
