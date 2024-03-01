const express = require('express');
const sequelize = require('./config/db');
require('dotenv').config();
const Order = require('./models/order'); 
const app = express();
// const port = 3002;


app.use(express.json());

app.post('/orders', async (req, res) => {
  try {
    const order = await Order.create(req.body);
    res.json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Add more routes as needed...

const start = async () => {
  try {
    await sequelize.sync(); // This connects to the database and creates tables if they don't exist
    app.listen(process.env.PORT, () => {
      console.log(`Order management service running on port ${process.env.PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

start();