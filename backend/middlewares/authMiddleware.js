const jwt = require('jsonwebtoken');
const User = require('../models/Usermodels');
const asyncHandler = require('express-async-handler');
const Cookies = require('cookie-parser');
require("dotenv").config();
const protect = asyncHandler(async (req, res, next) => {
    let token;
    if (req.cookies && req.cookies.authToken) {
        token = req.cookies.authToken;
        console.log("Token found in cookies:", token); 
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log("Decoded token:", decoded);

            req.user = await User.findById(decoded.userId).select('-password');
            if (!req.user) {
                console.log("User not found:", decoded.userId);
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }
            next();
        } catch (error) {
            console.error('Error with authentication token:', error);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        console.log("No token found in cookies"); 
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
});
module.exports = { protect };  
