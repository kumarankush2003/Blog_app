const asyncHandler = require( "express-async-handler" );
const User = require( "../models/Usermodels" );
const bcrypt = require( "bcrypt" );
const Usermailer = require("../utills/mailler");
const crypto = require('crypto');
const jwt = require("jsonwebtoken");
require('dotenv').config();
const { generateOtp, sendOtpEmail } = require("../utills/otp");

// const registerUser = async ( req, res ) =>
// {
//     const { Name, email, password, Phone, isBlocked } = req.body;
//     const userExist = await User.findOne( { email } );
//     if ( userExist )
//     {
//         res.status( 404 );
//     }
//     const existingCreator = await User.findOne( { role: 'creator' } );
//     const role = existingCreator ? 'user' : 'creator';
//     const hashedPassword = await bcrypt.hash( password, 10 );
//     const user = await User.create( {
//         Name,
//         email,
//         password: hashedPassword,
//         Phone,
//         isBlocked,
//         role
            // isVerified: false,
            // otp,
            // otpExpire,
//     } );
//     res.status( 201 ).json( {
//         _id: user._id,
//         Name: user.Name,
//         email: user.email,
//         Phone: user.Phone,
//         isBlocked: user.isBlocked,
//         role: user.role,
//     } );
// }


const registerUser = async (req, res) => {
    const { Name, email, password, Phone, isBlocked } = req.body;

    // Check if user already exists
    const userExist = await User.findOne({ email });
    if (userExist) {
    return res.status(404).json({ message: "User already exists" });
    }

    const existingCreator = await User.findOne({ role: "creator" });
    const role = existingCreator ? "user" : "creator";
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
    Name,
    email,
    password: hashedPassword,
    Phone,
    isBlocked,
    role,
    isVerified: false
    });
    res.status(201).json({
    _id: user._id,
    Name: user.Name,
    email: user.email,
    Phone: user.Phone,
    isBlocked: user.isBlocked,
    role: user.role,
    message: "Registration successful. An OTP has been sent to your email for verification.",
    });
}

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res
    .status(200)
    .cookie("authToken", token, {
        expires: new Date(Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true,
    })
    .json({
        success: true,
        message: "Login successful",
        user: { id: user._id, name: user.name, email: user.email },
        token,
    });
});


const logoutUser = asyncHandler(async (req, res) => {
    res
        .status(200)
        .clearCookie("authToken", {
            httpOnly: true,
        })
        .json({ success: true, message: "Logged out successfully" });
});


const getMe = asyncHandler( async ( req, res ) =>
{
    const user = await User.findById( req.user._id );
    if ( !user )
    {
        res.status( 404 );
    }
    res.status( 200 ).json( {
        _id: user._id,
        Name: user.Name,
        email: user.email,
        Phone: user.Phone,
        isBlocked: user.isBlocked,
        role: user.role,
    } );
} )
const updateProfile = asyncHandler( async ( req, res ) =>
{
    const user = await User.findById( req.user._id );
    if ( !user )
    {
        res.status( 404 );
    }
    user.Name = req.body.Name;
    user.email = req.body.email;
    user.Phone = req.body.Phone;
    await user.save();
    res.status( 200 ).json( {
        _id: user._id,
        Name: user.Name,
        email: user.email,
        Phone: user.Phone,
        isBlocked: user.isBlocked,
        role: user.role,
    } );
} )

const sendMail = async (req, res, next) => {
    try {
        const { email } = req.body;
        const otp = generateOtp();
        const otpExpire = Date.now() + 10 * 60 * 1000;
        await sendOtpEmail(email, otp);
        const user = await User.findOne({email});
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        user.otp = otp;
        user.otpExpire = otpExpire;
        await user.save();
        res.json({
            message: "Otp sent successfully"
        })
    } catch (error) {
        res.status(500).json({ message: "An error occurred while sending OTP", error: error.message });
    }
};
// Reset Password Controller
const forgotPassword = asyncHandler(async (req, res) => {
    const { password, otp } = req.body;
  
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
  
    if (user.otp !== otp || user.otpExpire < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }
  
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    
    await user.save();
  
    res.json({
      message: "Password reset successful",
    });
  });


const deleteprofile = asyncHandler( async ( req, res ) =>
{
    const user = await User.findById( req.user._id );
    if ( !user )
    {
        res.status( 404 );
    }
    await user.deleteOne();
    res.status( 200 ).json( {
        message: "User deleted successfully",
    } );
} )


module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    getMe,
    updateProfile,
    forgotPassword,
    deleteprofile,
    sendMail
};  
