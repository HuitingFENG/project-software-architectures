// user-service/models/user.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const SALT_WORK_FACTOR = 10;

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    phone: { type: String, unique: true, sparse: true }, // Sparse allows for unique but optional fields
    password: { type: String, required: true }, // Password should be hashed in production
    // Role to distinguish between customer and agent
    role: { type: String, enum: ['customer', 'agent'], required: true },
    // QR code for session identification (if applicable)
    qrCode: { type: String, default: '' },
    parkId: { type: String, default: '' }, // Park ID if applicable for agents
    // Orders array to keep track of user orders
    // orders: [{ type: Schema.Types.ObjectId, ref: 'Order' }] // Assuming there is an Order model
}, { timestamps: true }); // Add timestamps for record keeping


// Pre-save hook to hash the password
userSchema.pre('save', function(next) {
    let user = this;
    
    // Only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) return next();
  
    // Generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
      if (err) return next(err);
  
      // Hash the password using the new salt
      bcrypt.hash(user.password, salt, function(err, hash) {
        if (err) return next(err);
  
        // Override the plaintext password with the hashed one
        user.password = hash;
        next();
      });
    });
});



const User = mongoose.model('User', userSchema);

module.exports = User;
