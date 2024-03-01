// orderRoutes.js
const express = require('express');
const Order = require('../models/order'); 

const router = express.Router();

router.get('/orders', async (req, res) => {
    try {
      const orders = await Order.findAll();
      res.json(orders);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
});
  
  
// POST route for creating an order
router.post('/orders', async (req, res) => {
    try {
        // Extract order data from the request body
        const { userId, products, status, totalPrice } = req.body;

        // Validate input data (basic example, consider more comprehensive validation)
        if (!userId || !products || !status || !totalPrice) {
        return res.status(400).json({ error: 'Missing required order fields' });
    }

    // Create the order in the database
    const order = await Order.create({
        userId,
        products,
        status,
        totalPrice
    });

    // Respond with the created order
    res.status(201).json(order);
    } catch (error) {
        // Handle any errors
        console.error('Error creating order:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


router.patch('/orders/:orderId', async (req, res) => {
try {
    const order = await Order.findByPk(req.params.orderId);
    if (order) {
    await order.update(req.body);
    res.json(order);
    } else {
    res.status(404).json({ error: 'Order not found' });
    }
} catch (error) {
    res.status(400).json({ error: error.message });
}
});


router.delete('/orders/:orderId', async (req, res) => {
try {
    const numDeletedOrders = await Order.destroy({
    where: { id: req.params.orderId }
    });
    if (numDeletedOrders > 0) {
    res.status(204).send();
    } else {
    res.status(404).json({ error: 'Order not found' });
    }
} catch (error) {
    res.status(400).json({ error: error.message });
}
});


module.exports = router;


