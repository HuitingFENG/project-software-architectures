// product-catalog-service/models/product.js
const mongoose = require('mongoose');
// const Counter = require('./counter');

const productSchema = new mongoose.Schema({
    number: { type: Number, unique: true },  // the understandable id of product
    name: { type: String, required: true },
    description: { type: String},
    price: { type: Number, required: true}, 
    category: { type: String, enum: ['beverage', 'food', 'brunch'], required: true }, 
}, { timestamps: true }); 


const Product = mongoose.model('Product', productSchema);

module.exports = Product;
