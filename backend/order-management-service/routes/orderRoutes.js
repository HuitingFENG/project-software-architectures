// orderRoutes.js
const express = require('express');
const Order = require('../models/order'); 
const axios = require('axios'); 
const router = express.Router();

const fetchProductDetails = async (productNumber) => {
    const response = await axios.get(`${process.env.PRODUCT_CATALOG_SERVICE_URL}/number/${productNumber}`);
    console.log("response: ", response);
    console.log("response.data: ", response.data);
    return response.data[0];
};

const fetchCustomerDetails = async (customerEmail) => {
    const response = await axios.get(`${process.env.USER_SERVICE_URL}/email/${customerEmail}`);
    console.log("response.data: ", response.data)
    return response.data;
};

router.get('/orders', async (req, res) => {
    try {
      const orders = await Order.findAll();
      res.json(orders);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
});

router.get('/orders/:id', async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.id);
        // res.json(orders);
        if (!order) {
            return res.status(404).send({ message: 'Order not found' });
        }
        res.json(order);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});


router.post('/orders', async (req, res) => {
    try {
        const { customers, sessionId, products } = req.body;
        let totalPrice = 0;
        const productsDetail = [];
        const customersDetail = [];

        for (const product of products) {
            const productDetail = await fetchProductDetails(product.number);
            console.log("productDetail: ", productDetail);
            const productTotal = productDetail.price * product.quantity;
            totalPrice += productTotal;

            productsDetail.push({
                number: product.number, 
                quantity: product.quantity,
                price: productDetail.price,
                total: productTotal,
            });
        }

        for (const customer of customers) {
            const customerDetail = await fetchCustomerDetails(customer.email);
            console.log("customerDetail: ", customerDetail);
            customersDetail.push({
                id: customerDetail._id, 
                name: customerDetail.name,
                email: customerDetail.email,
                phone: customerDetail.phone,
            });
        }

        const order = await Order.create({
            customers: customersDetail,
            sessionId,
            products: productsDetail,
            totalPrice,
            status: "pending"
        });

        res.status(201).json(order);
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// // POST route for creating an order
// router.post('/orders', async (req, res) => {
//     try {
//         // Extract order data from the request body
//         const { customerId, sessionId, products, totalPrice } = req.body;

//         // Validate input data (basic example, consider more comprehensive validation)
//         if ( !customerId || !products || !sessionId || !totalPrice ) {
//         return res.status(400).json({ error: 'Missing required order fields' });
//     }

//     // Create the order in the database
//     const order = await Order.create({
//         customerId,
//         sessionId,
//         products,
//         totalPrice,
//         status: "pending"
//     });

//     // Respond with the created order
//     res.status(201).json(order);
//     } catch (error) {
//         // Handle any errors
//         console.error('Error creating order:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });



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


