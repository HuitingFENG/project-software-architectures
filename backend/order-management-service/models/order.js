// order-management-service/models/order.js
const { DataTypes } = require('sequelize');
const Sequelize = require('sequelize');
const sequelize = require('../config/db');

const Order = sequelize.define('Order', {
  
  products: {
    type: DataTypes.JSON, 
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,   // "pending", "completed"
    allowNull: false,
  },
  totalPrice: {
    type: DataTypes.FLOAT, 
    allowNull: false,
  },
  sessionId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
    // tableName: 'orders',
    timestamps: true,
});

module.exports = Order;