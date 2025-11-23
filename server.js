const express = require("express");
const fs = require("fs");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// File paths
const carsFile = "./data/cars.json";
const bookingsFile = "./data/bookings.json";

// Read & Write helpers
const readData = (file) => JSON.parse(fs.readFileSync(file, "utf-8"));
const writeData = (file, data) =>
  fs.writeFileSync(file, JSON.stringify(data, null, 2));

// ROUTES


app.get("/", (req, res) => {
  res.json({ message: "✅ Backend is running — try /cars or /bookings" });
});


app.get("/health", (req, res) => {
  res.json({ ok: true });
});

//  Get available cars
app.get("/cars", (req, res) => {
  try {
    const cars = readData(carsFile);
    const availableCars = cars.filter((c) => !c.booked);
    res.json(availableCars);
  } catch (error) {
    res.status(500).json({ message: "Failed to load cars", error });
  }
});

//  Book request
app.post("/book", (req, res) => {
  const {
    carId,
    customerName,
    customerEmail,
    customerPhone,
    driverLicense,
    startDate,
    endDate,
  } = req.body;

  if (!carId || !customerName || !customerEmail || !startDate || !endDate) {
    return res.status(400).json({ message: "Missing required booking fields" });
  }

  let cars = readData(carsFile);
  let bookings = readData(bookingsFile);

  const car = cars.find((c) => c.id === carId);

  if (!car) {
    return res.status(404).json({ message: "Car not found" });
  }

  if (car.booked) {
    return res.status(400).json({ message: "Car is already booked" });
  }

  // Mark car as booked
  car.booked = true;
  writeData(carsFile, cars);

  const newBooking = {
    id: Date.now(),
    carId,
    customerName,
    customerEmail,
    customerPhone,
    driverLicense,
    startDate,
    endDate,
    timestamp: new Date().toISOString(),
  };

  bookings.push(newBooking);
  writeData(bookingsFile, bookings);

  res.json({ message: "✅ Booking successful", booking: newBooking });
});

//  Get all bookings
app.get("/bookings", (req, res) => {
  try {
    const bookings = readData(bookingsFile);
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Failed to load bookings", error });
  }
});

//  Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});