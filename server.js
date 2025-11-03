// Importing the Express library and other necessary libraries
const express = require("express");
const fs = require("fs");           
const cors = require("cors");       
const bodyParser = require("body-parser"); 

// Creating an express app
const app = express();
const PORT = 3000; 


app.use(cors()); 
app.use(bodyParser.json()); 

// Defining the file paths
const carsFile = "./data/cars.json";
const bookingsFile = "./data/bookings.json";

// Helper functions for reading and writing JSON files
const readData = (file) => JSON.parse(fs.readFileSync(file, "utf-8"));
const writeData = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2));



// Accesing available cars
app.get("/cars", (req, res) => {
  const cars = readData(carsFile);              
  const availableCars = cars.filter(c => !c.booked); // Only show cars not booked
  res.json(availableCars);                     
});

// Bookings
app.post("/book", (req, res) => {
  
  const { carId, userId, startDate, endDate } = req.body;

  // Reading existing data
  const cars = readData(carsFile);
  const bookings = readData(bookingsFile);

  // Finding the car being booked
  const car = cars.find(c => c.id === carId);

  
  if (!car || car.booked) {
    return res.status(400).json({ message: "Car not available" });
  }

  
  car.booked = true;
  writeData(carsFile, cars); // Save changes

  // Create a new booking record
  const newBooking = {
    id: Date.now(), // unique ID
    carId,
    userId,
    startDate,
    endDate
  };

  bookings.push(newBooking);
  writeData(bookingsFile, bookings);

  // Send confirmation back
  res.json({ message: "Booking successful", booking: newBooking });
});


app.get("/bookings", (req, res) => {
  const bookings = readData(bookingsFile);
  res.json(bookings);
});

// Root route (simple check that the backend is running)
app.get("/", (req, res) => {
  res.json({ message: "Backend is running! Try /cars or /bookings" });
});
// Root route (simple check that the backend is running)
app.get("/", (req, res) => {
  res.json({ message: "Backend is running! Try /cars or /bookings" });
});

app.get("/health", (req, res) => {
  res.json({ ok: true });
});




app.listen(PORT, () => console.log(` Server running on http://localhost:${PORT}`));
