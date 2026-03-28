const express = require("express");

const {
  getAllTherapists,
  createRequestedBooking,
} = require("../controllers/bookingController");
const protect = require("../../../middlewares/authMiddleware");

const BookingRoute = express.Router();

BookingRoute.get("/getalltherapists", getAllTherapists);
BookingRoute.post("/requestbooking", protect, createRequestedBooking);

module.exports = BookingRoute;
