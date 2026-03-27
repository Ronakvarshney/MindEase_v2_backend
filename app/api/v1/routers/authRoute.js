const express = require("express");
const { register, login, logout, verifyEmail, forgotPassword, resetPassword } = require("../controllers/authController");

const authRouter = express.Router();

authRouter.post("/v1/register" , register);
authRouter.post("/v1/login" , login);
authRouter.get("/v1/logout" , logout);
authRouter.get("/v1/verify-email/:token/:role" , verifyEmail);
authRouter.get("/v1/forgot-password" , forgotPassword);
authRouter.post("/v1/reset-password" , resetPassword);

module.exports = authRouter ;