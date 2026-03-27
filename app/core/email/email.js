const transporter = require("../../db/nodemailer");

const sendVerificationEmail = async (email , token) => {
  try {
    const mail = await transporter.sendMail({
      from: "ronakvarshney7100@gmail.com",
      to: email,
      subject: "Email Verification for Mental Health App",
      html: `<p>Thank you for registering on our Mental Health App. Please click the link below to verify your email address:</p>
        <a href="http://localhost:3000/verify-email?token=${token}">Verify Email</a>
        <p>This link will expire in 24 hours.</p>
        `,
    });
    console.log("Verification email sent:", mail.response);
  } catch (err) {
    console.error("Error sending verification email:", err);
    throw err;
  }
};

const sendResetPasswordEmail = async (email, token) => {
  try {
    const mail = await transporter.sendMail({
      from: "ronakvarshney7100@gmail.com",
      to: email,
      subject: "Password Reset for Mental Health App",
      html: `<p>You requested a password reset for your Mental Health App account. Please click the link below to reset your password:</p>
        <a href="http://localhost:3000/reset-password?token=${token}">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        `,
    });
    console.log("Password reset email sent:", mail.response);
  } catch (err) {
    console.error("Error sending password reset email:", err);
    throw err;
  }
};

module.exports = {
  sendVerificationEmail,
  sendResetPasswordEmail,
};
