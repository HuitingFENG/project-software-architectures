// product-service/routes/productRoutes.js
const express = require('express');
const router = express.Router();
const Product = require('../models/product');

// Endpoint to add a new product
router.post('/add', async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    await newProduct .save();
    res.status(201).send({ product: newProduct, message: 'Product added successfully' });
  } catch (error) {
    res.status(400).send(error);
  }
});

// Endpoint to retrieve all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({});
    res.send(products);
  } catch (error) {
    res.status(500).send(error);
  }
});

// GET /products/:id to retrieve a product by their ID
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).send({ message: 'Product not found' });
        }
        res.send(product);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// GET /products/category/:categoryName to retrieve products by their category
router.get('/category/:categoryName', async (req, res) => {
    try {
        const products = await Product.find({ category: req.params.categoryName });
        if (products.length === 0) {
            return res.status(404).send({ message: 'No products found in this category' });
        }
        res.send(products);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// PUT /products/:id to update a product by id
router.put('/:id', async (req, res) => {
    try {
      const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!product) {
        return res.status(404).send({ message: 'Product not found' });
      }
      res.send({ product, message: 'Product updated successfully' });
    } catch (error) {
      res.status(400).send({ error: error.message });
    }
});
  
// DELETE /products/:id to delete a product by id
router.delete('/:id', async (req, res) => {
    try {
      const product = await Product.findByIdAndDelete(req.params.id);
      if (!product) {
        return res.status(404).send({ message: 'Product not found' });
      }
      res.send({ message: 'Product deleted successfully' });
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
});


module.exports = router;
