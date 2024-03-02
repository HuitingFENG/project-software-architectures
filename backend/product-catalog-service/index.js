require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authenticateToken = require('./middleware/authenticateToken');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

app.use(express.json());


app.use(authenticateToken);

app.get('/', (req, res) => {
  res.send('Product Catalog Service');
});

const productRoutes = require('./routes/productRoutes');
app.use('/products', productRoutes);

app.listen(port, () => {
  console.log(`Product Catalog service listening at http://localhost:${port}`);
});
