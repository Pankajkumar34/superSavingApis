const jwt = require('jsonwebtoken');
const models = require('../models/index'); 
const bcrypt = require("bcrypt")
exports.verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; 
    if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; 
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

exports.verifyRole = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      const user = await models.userModel.findById(req.user.id);
      if (!user) return res.status(404).json({ message: 'User not found' });

      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({ message: 'Forbidden: insufficient permissions' });
      }

      next();
    } catch (err) {
      res.status(500).json({ message: 'Server error in role verification' });
    }
  };
};


exports.passwordHash = async (pass) => {
  try {
    const saltRounds = 10;
    const hash = await bcrypt.hash(pass, saltRounds);
    return hash;
  } catch (error) {
    console.error('Error hashing password:', error);
    throw error;
  }
};

exports.compareHash = async (existPass,newPass) => {
  try {
    const isTrue = await bcrypt.compare(existPass, newPass);
    return isTrue;
  } catch (error) {
    console.error('Error hashing password:', error);
    throw error;
  }
};