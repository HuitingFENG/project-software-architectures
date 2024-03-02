// user-service/routes/userRoutes.js
require('dotenv').config();
const express = require('express');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET; 
const JWT_EXPIRES_IN = '1h'; 
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 
  
    if (token == null) return res.sendStatus(401);
  
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
};


// Endpoint to register a new user
router.post('/register', async (req, res) => {
    try {
        const newUser = new User(req.body);
        await newUser.save();
        // res.status(201).send({ user: newUser, message: 'User registered successfully' });
        res.status(201).send({ 
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                phone: newUser.phone,
                role: newUser.role,
                qrCode: newUser.qrCode,
                parkId: newUser.parkId,
            }, 
            message: 'User registered successfully' 
        });
    } catch (error) {
    res.status(400).send(error);
    }
});

// Endpoint to validate the user
router.post('/validate', async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email }).exec();
      if (user && bcrypt.compareSync(password, user.password)) {
        res.json({ isValid: true, userId: user._id });
      } else {
        res.json({ isValid: false });
      }
    } catch (error) {
      res.status(500).json({ message: 'Error validating user', error: error.message });
    }
});

// Endpoint to handle login
router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email }).exec();
  
      if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(401).send({ message: 'Invalid credentials' });
      }
  
      // Create a token
      const token = jwt.sign(
        { userId: user._id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );
  
      res.send({ token });
    } catch (error) {
      res.status(500).send({ message: 'Authentication failed', error: error.message });
    }
});

// Endpoint to retrieve all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find({});
    res.send(users);
  } catch (error) {
    res.status(500).send(error);
  }
});

// GET /users/:id to retrieve a user by their ID
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }
        res.send(user);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// GET /users/email/:email to retrieve a user by email
router.get('/email/:email', async (req, res) => {
    try {
      const user = await User.findOne({ email: req.params.email });
      if (!user) {
        return res.status(404).send({ message: 'User not found' });
      }
      res.send(user);
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
});
  
// PUT /users/:id to update a user by id
router.put('/:id', async (req, res) => {
    try {
      const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!user) {
        return res.status(404).send({ message: 'User not found' });
      }
      res.send({ user, message: 'User updated successfully' });
    } catch (error) {
      res.status(400).send({ error: error.message });
    }
});
  
// DELETE /users/:id to delete a user by id
router.delete('/:id', async (req, res) => {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) {
        return res.status(404).send({ message: 'User not found' });
      }
      res.send({ message: 'User deleted successfully' });
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
});


module.exports = router;
