// models/flightModel.js
const mongoose = require('mongoose');

const FlightSchema = new mongoose.Schema({

        departureCity: { type: String},
        arrivalCity: {String},
        createdAt: { type: Date, default: Date.now }
    
});
// Export the model so it can be used in other parts of the application.
module.exports = mongoose.model('Flight',FileListlightSchema);