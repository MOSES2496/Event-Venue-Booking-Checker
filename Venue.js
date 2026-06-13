// models/Venue.js
const mongoose = require("mongoose");

const venueSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Venue name is required"],
      unique: true,
      trim: true,
    },
    capacity: {
      type: Number,
      required: true,
      min: [1, "Capacity must be at least 1"],
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    pricePerHour: {
      type: Number,
      required: true,
      min: [0, "Price cannot be negative"],
    },
    amenities: [String],
    operatingHours: {
      open: { type: Number, default: 8 },   // 8 AM
      close: { type: Number, default: 22 },  // 10 PM
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Venue = mongoose.model("Venue", venueSchema);
module.exports = Venue;
