// 'use strict';
// const {
//   Model
// } = require('sequelize');
// module.exports = (sequelize, DataTypes) => {
//   class Order extends Model {
//     static associate(models) {
//       // define association here
//     }
//   }
//   Order.init({
//     customerId: DataTypes.STRING,
//     sessionId: DataTypes.STRING,
//     products: DataTypes.JSON,
//     status: DataTypes.STRING,
//     totalPrice: DataTypes.FLOAT
//   }, {
//     sequelize,
//     modelName: 'Order',
//   });
//   return Order;
// };


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
    type: DataTypes.STRING,   // "pending", "paid"
    allowNull: false,
    defaultValue: "pending"
  },
  totalPrice: {
    type: DataTypes.FLOAT, 
    allowNull: false,
  },
  sessionId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  customers: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  payments: {
    type: DataTypes.JSON,
    allowNull: true,
  }
}, {
    tableName: 'orders',
    timestamps: true,
});

module.exports = Order;