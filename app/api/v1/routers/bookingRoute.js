const express = require("express");

const {
  getAllTherapists,
  createRequestedBooking,
  getBookings,
  getAllBookings,
  updateBookingStatus,
} = require("../controllers/bookingController");
const protect = require("../../../middlewares/authMiddleware");

const BookingRoute = express.Router();

BookingRoute.get("/getalltherapists", getAllTherapists);
BookingRoute.post("/requestbooking", protect, createRequestedBooking);
BookingRoute.get("/requestbookings", protect, getBookings);
BookingRoute.get("/bookings", protect, getAllBookings);
BookingRoute.put("/update/booking" , protect , updateBookingStatus);

module.exports = BookingRoute;
