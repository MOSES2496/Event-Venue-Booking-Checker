// models/Booking.js
const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    venueName: { type: String, required: true, trim: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    hour: { type: Number, required: true }, // 0-23
    guestName: { type: String, required: true },
    guestEmail: { type: String, required: true },
    eventType: { type: String, default: "Other" },
    notes: { type: String },
    status: { type: String, enum: ["booked", "cancelled"], default: "booked" },
  },
  { timestamps: true }
);

// Static helper to get booked hours for a venue+date
bookingSchema.statics.getBookedHours = async function (venueName, date) {
  return this.find({ venueName, date, status: { $ne: "cancelled" } }).select(
    "hour guestName guestEmail status"
  );
};

const Booking = mongoose.model("Booking", bookingSchema);
module.exports = Booking;
