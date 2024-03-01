const express = require('express');
const sequelize = require('./config/db');
const orderRoutes = require('./routes/orderRoutes');
require('dotenv').config();

const app = express();
app.use(express.json());

app.use('/', orderRoutes); 


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