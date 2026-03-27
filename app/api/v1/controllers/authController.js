const {
  sendResetPasswordEmail,
  sendVerificationEmail,
} = require("../../../core/email/email");
const { generateToken } = require("../../../core/security/jwt");
const admin = require("../../../models/admin");
const paitent = require("../../../models/paitent");
const therapist = require("../../../models/therapist");
const crypto = require("crypto");

class AuthController {
  async register(req, res) {
    try {
      const {
        name,
        email,
        password,
        role,
        specialization,
        bio,
        experience,
        active,
        fees,
        time,
        day,
      } = req.body;
      if (!name || !email || !password || !role) {
        return res.status(400).json({
          success: false,
          message: "Name , email , password and role are required",
        });
      }
      
      let user ;
      if (role === "therapist") {
        if (!specialization || !bio || !experience || !fees || !time || !day) {
          return res.status(400).json({
            success: false,
            message:
              "Specialization , bio , experience , fees , time and day are required for therapists",
          });
        }
        const token = crypto.randomBytes(32).toString("hex");

        user = new therapist({
          username: name,
          email,
          password,
          role,
          specialization,
          bio,
          experience,
          consultationFee: fees,
          emailverificationToken: token,
          emailVerificationTokenExpiry: Date.now() + 24 * 60 * 60 * 1000, // 24 hours expiry
          availableSlots: [
            {
              day: day,
              startTime: time.split("-")[0],
              endTime: time.split("-")[1],
            },
          ],
        });
        await sendVerificationEmail(email, token);
        await user.save();
      } else if (role === "patient") {
        const token = crypto.randomBytes(32).toString("hex");

        user = new paitent({
          username: name,
          email,
          password,
          role,
        });
        user.emailverificationToken = token;
        user.emailVerificationTokenExpiry =
          Date.now() + 24 * 60 * 60 * 1000; // 24 hours expiry

        // sendmail logic here using token
        console.log("Verification token for email:", token);
        await sendVerificationEmail(email, token);
        await user.save();
      }

      return res.status(201).json({
        success: true,
        message: "User registered successfully",
        user
      });
    } catch (err) {
      console.error("Error in register controller:", err);
      return res.status(500).json({
        success: false,
        message: "Server error in register controller",
      });
    }
  }

  async login(req, res) {
    try {
      const { email, password, role } = req.body;
      console.log(email, password, role);

      if (!["therapist", "patient", "admin"].includes(role)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid role" });
      }
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "Email and password are required",
        });
      }

      let token;
      let payload;

      if (role == "therapist") {
        const existingTherapist = await therapist
          .findOne({ email })
          .select("+password ");
        if (!existingTherapist) {
          return res.status(401).json({
            success: false,
            message: "Invalid email or password",
          });
        }

        const isMatch = await existingTherapist.comparePassword(password);
        if (!isMatch) {
          return res.status(401).json({
            success: false,
            message: "Invalid email or password",
          });
        }

        payload = {
          userId: existingTherapist._id,
          role: existingTherapist.role,
          email: existingTherapist.email,
        };

        token = generateToken(payload);
      } else if (role == "patient") {
        const existingPaitent = await paitent
          .findOne({ email })
          .select("+password");

        console.log(existingPaitent);

        if (!existingPaitent) {
          return res.status(401).json({
            success: false,
            message: "Invalid email or password",
          });
        }

        const isMatch = await existingPaitent.comparePassword(password);
        if (!isMatch) {
          return res.status(401).json({
            success: false,
            message: "Invalid email or password",
          });
        }

        payload = {
          userId: existingPaitent._id,
          role: existingPaitent.role,
          email: existingPaitent.email,
        };

        token = generateToken(payload);
      } else {
        const existingAdmin = await admin
          .findOne({ email })
          .select("+password");
        if (!existingAdmin) {
          return res.status(401).json({
            success: false,
            message: "Invalid email or password",
          });
        }

        const isMatch = await existingAdmin.comparePassword(password);
        if (!isMatch) {
          return res.status(401).json({
            success: false,
            message: "Invalid email or password",
          });
        }

        payload = {
          userId: existingAdmin._id,
          role: existingAdmin.role,
          email: existingAdmin.email,
        };

        token = generateToken(payload);
      }

      console.log(token);

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000,
      });

      return res.status(200).json({
        success: true,
        message: "Login successful",
        user: {
          id: payload?.userId,
          email: payload?.email,
          role: payload?.role,
        },
      });
    } catch (err) {
      console.error("Error in login controller:", err);
      return res.status(500).json({
        success: false,
        message: "Server error in login controller",
      });
    }
  }

  async logout(req, res) {
    try {
      res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });
      return res.status(200).json({
        success: true,
        message: "Logout successful",
      });
    } catch (err) {
      console.error("Error in logout controller:", err);
      res.status(500).json({
        success: false,
        message: "Server error in logout controller",
      });
    }
  }

  async verifyEmail(req, res) {
    try {
      console.log("verification");
      const { token, role } = req.params;
      console.log("token->", token);
      console.log("role", role)
      if (!token || !role) {
        return res.status(400).json({
          success: false,
          message: "Verification token is required",
        });
      }

      if (role == "patient") {
        const existingPaitent = await paitent.findOne({
          emailverificationToken: token,
          emailVerificationTokenExpiry: { $gt: Date.now() },
        });
        console.log(existingPaitent);
        if (!existingPaitent) {
          return res.status(400).json({
            success: false,
            message: "Invalid or expired verification token",
          });
        }
        existingPaitent.emailVerified = true;
        existingPaitent.emailverificationToken = undefined;
        existingPaitent.emailVerificationTokenExpiry = undefined;
        await existingPaitent.save();
      } else {
        const exisitingTherapist = await therapist.findOne({
          emailVerificationToken: token,
          emailVerificationTokenExpiry: { $gt: Date.now() },
        });

        if (!exisitingTherapist) {
          return res.status(400).json({
            success: false,
            message: "Invalid or expired verification token",
          });
        }

        exisitingTherapist.emailVerified = true ;
        exisitingTherapist.emailVerificationToken = undefined ;
        exisitingTherapist.emailVerificationTokenExpiry = undefined ;
        await exisitingTherapist.save();
      }

      return res.status(200).json({
        success: true,
        message: "Email verified successfully",
      });
    } catch (err) {
      console.error("Error in email verification controller:", err);
      return res.status(500).json({
        success: false,
        message: "Server error in email verification controller",
      });
    }
  }

  async forgotPassword(req, res) {
    try {
      const { email, role } = req.body;
      if (!email)
        return res.status(400).json({
          message: "email not get",
        });

      if (role == "paitent") {
        const exisitingPaitent = await paitent.findOne({ email: email });
        if (!exisitingPaitent) {
          return res.status(404).json({
            success: false,
            message: "No user found with this email",
          });
        }
        const resetToken = crypto.randomBytes(32).toString("hex");
        exisitingPaitent.resetPasswordToken = resetToken;
        exisitingPaitent.resetPasswordTokenExpiry = Date.now() + 60 * 60 * 1000; // 1 hour expiry
        await sendResetPasswordEmail(email, resetToken);
        await exisitingPaitent.save();
        return res.status(200).json({
          success: true,
          message: "Password reset email sent",
        });
      } else if (role == "therapist") {
        const exisitingTherapist = await therapist.findOne({
          email: email,
        });
        if (!exisitingTherapist) {
          return res.status(404).json({
            success: false,
            message: "No user found with this email",
          });
        }
        const resetToken = crypto.randomBytes(32).toString("hex");
        exisitingTherapist.resetPasswordToken = resetToken;
        exisitingTherapist.resetPasswordTokenExpiry =
          Date.now() + 60 * 60 * 1000;
        await sendResetPasswordEmail(email, resetToken);
        await exisitingTherapist.save();
        return res.status(200).json({
          success: true,
          message: "Password reset email sent",
        });
      }
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "server error in forgot password controller",
      });
    }
  }

  async resetPassword(req, res) {
    try {
      const { token, newPassword, role } = req.body;
      if (!token || !newPassword) {
        return res.status(400).json({
          success: false,
          message: "Token and new password are required",
        });
      }
      if (role == "paitent") {
        const existingPaitent = await paitent.findOne({
          resetPasswordToken: token,
          resetPasswordTokenExpiry: { $gt: Date.now() },
        });
        if (!existingPaitent) {
          return res.status(400).json({
            success: false,
            message: "Invalid or expired reset token",
          });
        }
        existingPaitent.password = newPassword;
        existingPaitent.resetPasswordToken = undefined;
        existingPaitent.resetPasswordTokenExpiry = undefined;
        await existingPaitent.save();
        return res.status(200).json({
          success: true,
          message: "Password reset successfully",
        });
      } else if (role == "therapist") {
        const existingTherapist = await therapist.findOne({
          resetPasswordToken: token,
          resetPasswordTokenExpiry: { $gt: Date.now() },
        });
        if (!existingTherapist) {
          return res.status(400).json({
            success: false,
            message: "Invalid or expired reset token",
          });
        }
        existingTherapist.password = newPassword;
        existingTherapist.resetPasswordToken = undefined;
        existingTherapist.resetPasswordTokenExpiry = undefined;
        await existingTherapist.save();
        return res.status(200).json({
          success: true,
          message: "Password reset successfully",
        });
      }
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "server error in reset password controller",
      });
    }
  }
}

module.exports = new AuthController();
