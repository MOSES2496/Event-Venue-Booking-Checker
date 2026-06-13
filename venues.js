// routes/venues.js
const express = require("express");
const router = express.Router();
const Venue = require("./Venue");

// GET /api/venues — list all active venues
router.get("/", async (req, res) => {
  try {
    const venues = await Venue.find({ isActive: true }).sort({ name: 1 });
    return res.status(200).json({ success: true, count: venues.length, venues });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

// POST /api/venues — create a venue
router.post("/", async (req, res) => {
  try {
    const venue = await Venue.create(req.body);
    return res.status(201).json({ success: true, venue });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: "Venue name already exists" });
    }
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

// POST /api/venues/seed — seeds sample venues for demo
router.post("/seed", async (req, res) => {
  try {
    const sampleVenues = [
      {
        name: "Grand Ballroom",
        capacity: 500,
        location: "Floor 3, Main Building",
        pricePerHour: 5000,
        amenities: ["Stage", "LED Lighting", "Sound System", "AC"],
        operatingHours: { open: 8, close: 23 },
      },
      {
        name: "Crystal Hall",
        capacity: 200,
        location: "East Wing",
        pricePerHour: 3000,
        amenities: ["Projector", "Whiteboard", "Catering Kitchen"],
        operatingHours: { open: 9, close: 21 },
      },
      {
        name: "Rooftop Terrace",
        capacity: 100,
        location: "Rooftop, 7th Floor",
        pricePerHour: 2000,
        amenities: ["Open Air", "City View", "Bar Counter"],
        operatingHours: { open: 16, close: 23 },
      },
    ];

    // insertMany with ordered:false to skip duplicates
    const result = await Venue.insertMany(sampleVenues, { ordered: false }).catch((e) => {
      if (e.code === 11000) return { insertedCount: e.result?.nInserted || 0 };
      throw e;
    });

    return res.status(200).json({
      success: true,
      message: "Sample venues seeded",
      inserted: result.insertedCount ?? sampleVenues.length,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Seeding failed", error: error.message });
  }
});

module.exports = router;