// session-management-service/models/session.js
const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    customers: [{ type: String, ref: 'User' }], 
    orders: [{ type: String, ref: 'Order' }],
    // agentId: { type: String, ref: 'User' },
    qrCode: { type: String, required: true }, 
    status: { type: String, enum: ['vacant', 'active', 'closed'], default: 'vacant' }, 
}, { timestamps: true }); 

const Session = mongoose.model('Session', sessionSchema);

module.exports = Session;