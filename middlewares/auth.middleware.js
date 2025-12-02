const jwt = require('jsonwebtoken');
const models = require('../models/index'); 
const bcrypt = require("bcrypt")
exports.verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.cookies.accessToken;

    if (!authHeader) {
      return res.status(401).json({ message: "Access denied. No token provided." });
    }

    const token = authHeader
  
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {

        // Token EXPIRED
        
        if (err.name === "TokenExpiredError") {
          return res.status(401).json({
            message: "Access token expired, please login again.",
            isExpired: true
          });
        }
        return res.status(401).json({
          message: "Invalid token."
        });
      }

      req.user = decoded;
      next();
    });

  } catch (error) {
    console.log("Auth error:", error);
    return res.status(500).json({ message: "Server error." });
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

