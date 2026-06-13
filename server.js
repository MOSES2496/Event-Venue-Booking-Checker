require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const connectDB = require("./db");

const bookingsRouter = require("./bookings");
const venuesRouter = require("./venues");

const app = express();
app.use(cors());
app.use(express.json());

// Serve static frontend from /public
app.use(express.static(path.join(__dirname, "public")));

// Connect to MongoDB
connectDB();

// Serve the frontend index
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));

app.use("/api/bookings", bookingsRouter);
app.use("/api/venues", venuesRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server listening on port ${PORT}`));

module.exports = app;
