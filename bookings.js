// routes/bookings.js
const express = require("express");
const router = express.Router();
const Booking = require("./Booking");

// ─────────────────────────────────────────
// GET /api/bookings/availability
// Query: ?venue=GrandHall&date=2024-12-25
// Returns: booked hours array so the UI can disable those grid buttons
// ─────────────────────────────────────────
router.get("/availability", async (req, res) => {
  try {
    const { venue, date } = req.query;

    if (!venue || !date) {
      return res.status(400).json({
        success: false,
        message: "Both 'venue' and 'date' query params are required",
      });
    }

    // Fetch all non-cancelled bookings for this venue+date
    const bookedSlots = await Booking.getBookedHours(venue, date);

    // Extract just the hour numbers for the frontend grid
    const unavailableHours = bookedSlots.map((b) => b.hour);

    return res.status(200).json({
      success: true,
      venue,
      date,
      unavailableHours,        // e.g. [9, 10, 14, 15]
      bookedSlots,             // full details for admin view
      totalBooked: unavailableHours.length,
    });
  } catch (error) {
    console.error("Availability check error:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

// ─────────────────────────────────────────
// POST /api/bookings
// Body: { venueName, date, hour, guestName, guestEmail, eventType, notes }
// Books a specific hour slot
// ─────────────────────────────────────────
router.post("/", async (req, res) => {
  try {
    const { venueName, date, hour, guestName, guestEmail, eventType, notes } = req.body;

    // Validate required fields
    if (!venueName || !date || hour === undefined || !guestName || !guestEmail) {
      return res.status(400).json({
        success: false,
        message: "Required fields: venueName, date, hour, guestName, guestEmail",
      });
    }

    // Check if slot is already taken
    const existing = await Booking.findOne({
      venueName,
      date,
      hour,
      status: { $ne: "cancelled" },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Slot at ${hour}:00 on ${date} for ${venueName} is already booked`,
      });
    }

    // Create the booking
    const booking = await Booking.create({
      venueName,
      date,
      hour,
      guestName,
      guestEmail,
      eventType: eventType || "Other",
      notes,
    });

    return res.status(201).json({
      success: true,
      message: "Slot booked successfully!",
      booking,
    });
  } catch (error) {
    // Duplicate key error (race condition)
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This slot was just booked by someone else. Please choose another.",
      });
    }
    console.error("Booking creation error:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

// ─────────────────────────────────────────
// GET /api/bookings
// Query: ?venue=GrandHall&date=2024-12-25 (both optional)
// Returns all bookings (admin view)
// ─────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const filter = {};
    if (req.query.venue) filter.venueName = req.query.venue;
    if (req.query.date) filter.date = req.query.date;

    const bookings = await Booking.find(filter).sort({ date: 1, hour: 1 });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

// ─────────────────────────────────────────
// DELETE /api/bookings/:id
// Cancel a booking (sets status to 'cancelled' — soft delete)
// ─────────────────────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: "cancelled" },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      booking,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

module.exports = router;