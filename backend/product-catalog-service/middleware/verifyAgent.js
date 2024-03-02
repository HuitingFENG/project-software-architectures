// middleware/verifyAgent.js

// Middleware to verify if the user is an agent
const verifyAgent = (req, res, next) => {
    if (!req.user || req.user.role !== 'agent') {
      return res.status(403).json({ message: 'Access denied. Only agents can perform this action.' });
    }
    next();
};
  
module.exports = verifyAgent;
