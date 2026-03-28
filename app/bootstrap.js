const express = require("express");
const config = require("./core/config");
const connectDB = require("./db/connectDB");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const authRouter = require("./api/v1/routers/authRoute");
const LLMRoute = require("./api/v1/routers/LLMRoute");
const BookingRoute = require("./api/v1/routers/bookingRoute");


const createApp = () => {
  const app = express();

  app.use(
    cors({
      origin: config.cors.origin,
      credentials: config.cors.credentials,
    }),
  );

  app.use(cookieParser());

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use('/api' , authRouter);
  app.use('/api/v1' , LLMRoute);
  app.use('/api/v1' , BookingRoute);

  app.get("/health", (req, res) => {
    res.status(200).json({
      success: true,
      message: "Server is healthy",
      timestamp: new Date().toISOString(),
    });
  });

  return app;
};

const InitializeApp = async () => {
  await connectDB();
  const app = createApp();
  return app;
};

module.exports = InitializeApp;
