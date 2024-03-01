// session-management-service/models/session.js
const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    customerId: { type: String, required: true },
    agentId: { type: String, required: true}, 
    qrCode: { type: String, required: true }, 
    status: { type: String, required: true }, 
}, { timestamps: true }); 

const Session = mongoose.model('Session', sessionSchema);

module.exports = Session;