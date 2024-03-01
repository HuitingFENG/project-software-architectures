// notification-service/models/notification.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userEmail: { type: String, required: true },
    message: { type: String, required: true}, 
    status: { type: String, required: true }, 
}, { timestamps: true }); 

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
