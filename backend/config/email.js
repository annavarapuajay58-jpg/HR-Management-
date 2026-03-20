const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // Use STARTTLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Verify transporter config on startup
transporter.verify((error) => {
  if (error) {
    console.error('❌ Email transporter error:', error.message);
  } else {
    console.log('✅ Email server is ready to send messages');
  }
});

const sendVerificationCode = async (email, code) => {
  const mailOptions = {
    from: `"HR Management System" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'HR Portal - Email Verification Code',
    html: `
      <div style="font-family: sans-serif; text-align: center; padding: 30px; border: 1px solid #eee; border-radius: 10px; max-width: 500px; margin: auto;">
        <h2 style="color: #6366f1;">Welcome to the HR & Employee Management System</h2>
        <p style="font-size: 1rem; color: #333;">Your verification code is:</p>
        <h1 style="letter-spacing: 8px; color: #4f46e5; font-size: 2.5rem; margin: 20px 0; background: #f5f3ff; padding: 15px; border-radius: 8px;">${code}</h1>
        <p style="color: #555;">This code will expire in <strong>10 minutes</strong>.</p>
        <p style="color: #999; font-size: 0.85rem;">If you did not request this, please ignore this email.</p>
      </div>
    `
  };

  return transporter.sendMail(mailOptions);
};

const sendPasswordResetCode = async (email, code) => {
  const mailOptions = {
    from: `"HR Management System" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'HR Portal - Password Reset Code',
    html: `
      <div style="font-family: sans-serif; text-align: center; padding: 30px; border: 1px solid #eee; border-radius: 10px; max-width: 500px; margin: auto;">
        <h2 style="color: #6366f1;">Password Reset Request</h2>
        <p style="font-size: 1rem; color: #333;">You requested a password reset. Use the code below:</p>
        <h1 style="letter-spacing: 8px; color: #4f46e5; font-size: 2.5rem; margin: 20px 0; background: #f5f3ff; padding: 15px; border-radius: 8px;">${code}</h1>
        <p style="color: #555;">This code will expire in <strong>10 minutes</strong>.</p>
        <p style="color: #999; font-size: 0.85rem;">If you did not request this, please ignore this email.</p>
      </div>
    `
  };

  return transporter.sendMail(mailOptions);
};

module.exports = { sendVerificationCode, sendPasswordResetCode };
