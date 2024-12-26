const nodeMailer = require("nodemailer");
require("dotenv").config();

const Usermailer = async (options) => {
  // Validate input options
  if (!options || !options.email || !options.subject || !options.message_Content) {
    console.error("Invalid options: Ensure email, subject, and message_Content are provided.");
    throw new Error("Invalid email options.");
  }

  // Create transporter
  let transporter;
  try {
    transporter = nodeMailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      service: process.env.SMTP_SERVICE,
      auth: {
        user: process.env.SMTP_MAIL,
        pass: process.env.SMTP_PASSWORD,
      },
      secure: process.env.SMTP_PORT === "465", // true for 465, false for other ports
      tls: {
        rejectUnauthorized: false, // Change according to your security policy
      },
    });
  } catch (error) {
    console.error("Error creating transporter:", error);
    throw new Error("Could not create transporter.");
  }

  // Prepare mail options
  const mailOptions = {
    from: process.env.SMTP_MAIL,
    to: options.email,
    subject: options.subject,
    html: options.message_Content,
  };

  // Send mail and return promise
  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        reject(new Error("Failed to send email."));
      } else {
        console.log('Email sent: ' + info.response);
        resolve(info.response);
      }
    });
  });
};

module.exports = Usermailer;
