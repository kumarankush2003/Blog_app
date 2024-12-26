const crypto = require("crypto");
const UserMailer = require("./mailler");
const User = require( "../models/Usermodels" );
const generateOtp = () => {
  return crypto.randomInt(100000, 999999).toString(); 
};
const sendOtpEmail = async (email, otp) => {
  try {
    const user = await User.findOne({ email });
    if (!user) throw new Error("User not found with the provided email.");

    const options = {
      name: user.Name,
      email: email,
      subject: "Verify OTP",
      message_Content:
        `<p> Hi ${user.name},</p><p>Your OTP for password verification is: <strong>${otp}</strong></p>`
    };

    await UserMailer(options);
    console.log("OTP email sent successfully.");
    
  } catch (error) {
    console.error("Error in sendOtpEmail:", error.message);
    throw error;
  }
};


module.exports = { generateOtp, sendOtpEmail };
