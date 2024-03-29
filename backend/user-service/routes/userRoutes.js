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
        // const newUser = new User(req.body);
        // await newUser.save();
        // res.status(201).send({ user: newUser, message: 'User registered successfully' });
        const { role, parkId, parkLocation, ...userData } = req.body;
        const newUser = new User(req.body);

        // Check if the role is 'agent' and parkId and parkLocation are provided
        if (role === 'agent') {
            if (!parkId || !parkLocation) {
                return res.status(400).send({ message: 'Park ID and Park Location are required for agents.' });
            }
            newUser.parkId = parkId;
            newUser.parkLocation = parkLocation;
            // Automatically create 20 alleys for the agent
            newUser.alleys = Array.from({ length: 20 }, (_, index) => ({
                alleyNumber: index + 1,
                qrCode: `QR-${parkId}-${parkLocation}-${index + 1}`
            }));
        }

        await newUser.save();

        res.status(201).send({ 
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                phone: newUser.phone,
                role: newUser.role,
                // qrCode: newUser.qrCode,
                // parkId: newUser.parkId,
                ...(role === 'agent' && { 
                    parkId: newUser.parkId,
                    parkLocation: newUser.parkLocation,
                    alleys: newUser.alleys,
                }),
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
        { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role, parkId: user.parkId, parkLocation: user.parkLocation },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );
      console.log("token: ", token);
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
    //   const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    //   if (!user) {
    //     return res.status(404).send({ message: 'User not found' });
    //   }
    //   res.send({ user, message: 'User updated successfully' });

    const { parkId, parkLocation, role, ...updateData } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
        return res.status(404).send({ message: 'User not found' });
    }
    if (role === 'agent' && parkId && parkLocation) {
        user.parkId = parkId;
        user.parkLocation = parkLocation;
        if (!user.alleys || user.alleys.length === 0) {
            user.alleys = Array.from({ length: 20 }, (_, index) => ({
                alleyNumber: index + 1,
                qrCode: `QR-${parkId}-${parkLocation}-${index + 1}`
            }));
        }
    }
    for (const [key, value] of Object.entries(updateData)) {
        user[key] = value;
    }
    await user.save();
    res.send({ user: user.toObject(), message: 'User updated successfully' });

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
