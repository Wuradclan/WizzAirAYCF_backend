const express = require('express');
const cron = require('node-cron');
const axios = require('axios');
const fs = require('fs');
const pdf = require('pdf-parse');
const Flight = require('./models/Flight.js');
const connectDB = require('./config/db.js');
const dotenv = require('dotenv');
const cors = require('cors');  // Import CORS
const path = './tmp';  // Specify the path to check


// Initialize environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize app
const app = express();

// Middleware to parse JSON
app.use(express.json()); 

// Enable CORS (Allowing localhost:3001)
app.use(cors());

app.set('trust proxy', true);

// Check if /tmp folder exists
if (!fs.existsSync(path)) {
    // If it doesn't exist, create the folder
    fs.mkdirSync(path);
    console.log('/tmp folder created');
  } else {
    console.log('/tmp folder already exists');
}
app.use('/', require('./routes/flightRoutes.js'));
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
