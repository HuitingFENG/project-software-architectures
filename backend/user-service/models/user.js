// user-service/models/user.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const SALT_WORK_FACTOR = 10;

const alleySchema = new mongoose.Schema({
    alleyNumber: Number, 
    qrCode: { type: String, required: true } 
  });
  

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    phone: { type: String, unique: true, sparse: true },
    password: { type: String, required: true }, 
    role: { type: String, enum: ['customer', 'agent'], required: true },
    // qrCode: { type: String, default: '' },  
    parkId: { type: String, default: '' }, 
    parkLocation: { type: String, default: '' }, 
    alleys: [alleySchema],
}, { timestamps: true }); 


// // Pre-save hook to hash the password
// userSchema.pre('save', function(next) {
//     let user = this;
    
//     // Only hash the password if it has been modified (or is new)
//     if (!user.isModified('password')) return next();
  
//     // Generate a salt
//     bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
//       if (err) return next(err);
  
//       // Hash the password using the new salt
//       bcrypt.hash(user.password, salt, function(err, hash) {
//         if (err) return next(err);
  
//         // Override the plaintext password with the hashed one
//         user.password = hash;
//         next();
//       });
//     });
// });


userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
      this.password = await bcrypt.hash(this.password, SALT_WORK_FACTOR);
    }

    if (this.role === 'agent' && this.isNew) {
        this.alleys = Array.from({ length: 20 }, (_, index) => ({
            alleyNumber: index + 1,
            qrCode: `QR-${this.parkId}-${this.parkLocation}-${index + 1}`
        }));
    }

    next();
});
  

const User = mongoose.model('User', userSchema);

module.exports = User;
