require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

app.use(express.json());

app.get('/', (req, res) => {
  res.send('User Service');
});

const userRoutes = require('./routes/userRoutes');
app.use('/users', userRoutes);

app.listen(port, () => {
  console.log(`User service listening at http://localhost:${port}`);
});