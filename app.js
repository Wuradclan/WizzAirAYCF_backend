const express = require('express');
const cron = require('node-cron');
const axios = require('axios');
const fs = require('fs');
const pdf = require('pdf-parse');
const Flight = require('./models/Flight.js');
const connectDB = require('./config/db.js');
const dotenv = require('dotenv');
const cors = require('cors');  // Import CORS


// Initialize environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize app
const app = express();

// Middleware to parse JSON
app.use(express.json()); 

// Enable CORS (Allowing localhost:3001)
app.use(cors({
    origin: 'https://sample-nodejs-app-production.up.railway.app',  // Replace with the actual frontend URL
  }));



// Routes
app.use('/api/flights/', require('./routes/flightRoutes.js'));

// Error handling middleware
app.use((error, req, res, next) => {
    console.error(error.stack);
    res.status(500).send('Something broke!');
});

// Start the scraping process

// Connect to MongoDB
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
