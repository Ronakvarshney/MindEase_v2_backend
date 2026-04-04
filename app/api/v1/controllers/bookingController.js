const { default: mongoose } = require("mongoose");
const bookings = require("../../../models/bookings");
const paitent = require("../../../models/paitent");
const therapist = require("../../../models/therapist");
const { transporter } = require("../../../db/nodemailer");

class BookingController {
  async createRequestedBooking(req, res) {
    try {
      const { fromdata, id } = req.body;
      const userId = req.user.userId;
      const role = req.user.role;
      if (!userId || !role) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const { cause, mode, date, meeting_time, contact_info } = fromdata;
      if (!cause || !mode || !date || !meeting_time || !contact_info) {
        return res.status(400).json({ message: "All fields are required" });
      }

      if (role !== "patient") {
        return res.status(403).json({ message: "Forbidden" });
      }

      if (
        !mongoose.Types.ObjectId.isValid(id) ||
        !mongoose.Types.ObjectId.isValid(userId)
      ) {
        return res.status(500).json({
          message: "Invalid therapist or paitent id",
        });
      }

      const exisitingBooking = await bookings.findOne({
        paitent: userId,
        therapist: id,
        status: { $in: ["pending", "confirmed"] },
        scheduledAt: new Date(`${date}`),
      });

      if (exisitingBooking)
        return res.status(400).json({
          message: "Booking already exists with this therapist",
        });

      const newBooking = await bookings.create({
        paitent: userId,
        therapist: id,
        cause: cause,
        meetingMode: mode,
        contact: contact_info,
        scheduledAt: new Date(`${date}`),
        status: "pending",
      });

      const existingtherapist = await therapist.findById(id);
      if (!existingtherapist)
        return res.status(404).json({
          message: "Therapist not found",
        });
      existingtherapist.requestedBookings.push(newBooking._id);
      await existingtherapist.save();
      return res.status(201).json({
        message: "Booking created successfully",
        booking: newBooking,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  async getBookings(req, res) {
    try {
      const userId = req.user.userId;
      const role = req.user.role;
      if (role !== "patient") {
        return res.status(403).json({ message: "Forbidden" });
      }
      const bookingsList = await bookings
        .find({ paitent: userId })
        .populate("therapist");
      return res.status(200).json({
        success: true,
        message: "Bookings retrieved successfully",
        bookings: bookingsList,
      });
    } catch (err) {
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  async getAllBookings(req, res) {
    try {
      const booking = await bookings
        .find()
        .populate("paitent", "username email")
        .populate("therapist");
      return res.status(200).json({
        success: true,
        message: "All bookings retrieved successfully",
        bookings: booking,
      });
    } catch (err) {
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  async updateBookingStatus(req, res) {
    try {
      const role = req.user.role;
      if (role !== "therapist") {
        return res.status(403).json({ message: "Forbidden" });
      }

      const { id, status } = req.query;
      if (!id || !status) {
        return res
          .status(400)
          .json({ message: "Booking ID and status are required" });
      }

      if (!["pending", "confirmed", "cancelled"].includes(status)) {
        return res.status(400).json({ message: "Invalid status value" });
      }

      const exisitingBooking = await bookings.findById(id);
      if (!exisitingBooking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      if (status === "confirmed") {
        const paitentId = exisitingBooking.paitent;
        const paitentdata = await paitent.findById(paitentId);
        if (!paitentdata) {
          return res.status(404).json({ message: "Paitent not found" });
        }

        paitentdata.bookings.push(exisitingBooking._id);
        await paitentdata.save();
      } else if (status === "cancelled") {
        await bookings.findByIdAndDelete(id);
      }

      exisitingBooking.status = status;
      await exisitingBooking.save();
      return res.status(200).json({
        message: "Booking status updated successfully",
        booking: exisitingBooking,
      });
    } catch (err) {
      return res
        .status(500)
        .json({ message: "Internal Server Error", error: err.message });
    }
  }

  async deleteRequestedBooking(req, res) {
    try {
      const userId = req.userId;
      const role = req.userRole;
      if (role !== "paitent")
        return res.status(400).json({ message: "role conflict" });

      const { id } = req.params;
      if (!id) return res.status(400).json({ message: "Booking id not gets" });

      const exisitingBooking = await bookings.findById(id);
      if (exisitingBooking.status !== "pending") {
        return res
          .status(400)
          .json({ message: "Only pending bookings can be deleted" });
      }
      if (!exisitingBooking) {
        return res
          .status(400)
          .json({ message: "Booking not exists with this therapist" });
      }

      await exisitingBooking.deleteOne();
      const exisitingpaitent = await paitent.findById(userId);
      if (!exisitingpaitent)
        return res.status(400).json({
          message: "paitent not exists",
        });

      exisitingpaitent.bookings.filter(
        (bookingId) => bookingId.toString() !== id,
      );
      await exisitingpaitent.save();

      return res.status(200).json({
        message: "Booking deleted successfully",
      });
    } catch (err) {
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  async getAllTherapists(req, res) {
    try {
      const therapists = await therapist.find();
      if (!therapist) {
        return res.status(400).json({
          message: "Therapists not exists.",
        });
      }

      return res.status(201).json({
        message: "All Therapists are:",
        therapists,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Internal server error",
      });
    }
  }
}

module.exports = new BookingController();
