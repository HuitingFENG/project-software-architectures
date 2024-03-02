// product-catalog-service/models/product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String},
    price: { type: Number, required: true}, 
    category: { type: String, enum: ['beverage', 'food', 'brunch'], required: true }, 
}, { timestamps: true }); 

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
