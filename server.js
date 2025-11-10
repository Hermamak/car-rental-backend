const express = require("express");
const fs = require("fs");
const cors = require("cors");
const bodyParser = require("body-parser");

// Creating an express app
const app = express();
const PORT = 80;

app.use(cors());
app.use(bodyParser.json());

// Defining the file paths
const carsFile = "./data/cars.json";
const bookingsFile = "./data/bookings.json";

// Helper functions
const readData = (file) => JSON.parse(fs.readFileSync(file, "utf-8"));
const writeData = (file, data) =>
  fs.writeFileSync(file, JSON.stringify(data, null, 2));

// ==== ROUTES ====

// Root route – server check
app.get("/", (req, res) => {
  res.json({ message: "Backend is running! Try /cars or /bookings" });
});

// Health check
app.get("/health", (req, res) => {
  res.json({ ok: true });
});

// Get cars
app.get("/cars", (req, res) => {
  const cars = readData(carsFile);
  const availableCars = cars.filter((c) => !c.booked);
  res.json(availableCars);
});

// Book a car
app.post("/book", (req, res) => {
  const { carId, userId, startDate, endDate } = req.body;

  const cars = readData(carsFile);
  const bookings = readData(bookingsFile);

  const car = cars.find((c) => c.id === carId);

  if (!car || car.booked) {
    return res.status(400).json({ message: "Car not available" });
  }

  car.booked = true;
  writeData(carsFile, cars);

  const newBooking = {
    id: Date.now(),
    carId,
    userId,
    startDate,
    endDate,
  };

  bookings.push(newBooking);
  writeData(bookingsFile, bookings);

  res.json({ message: "Booking successful", booking: newBooking });
});

// Get bookings
app.get("/bookings", (req, res) => {
  const bookings = readData(bookingsFile);
  res.json(bookings);
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

