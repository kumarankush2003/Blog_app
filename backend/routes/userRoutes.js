const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    logoutUser,
    getMe,
    updateProfile,
    sendMail,
    forgotPassword,
    deleteprofile,
} = require('../controllers/user_controller');
const { protect } = require('../middlewares/authMiddleware');
router.post('/register',registerUser);
router.post('/login', loginUser);
router.post('/logout', protect, logoutUser);
router.get('/me', protect, getMe);
router.post('/send',sendMail);
router.post('/forgot-password',protect,forgotPassword); // User requests a password reset token
router.put('/update-profile', protect, updateProfile);
router.delete('/delete', protect, deleteprofile);

module.exports = router;
