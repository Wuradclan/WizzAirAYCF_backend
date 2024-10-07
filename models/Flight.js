// models/flightModel.js
const mongoose = require('mongoose');

const FlightSchema = new mongoose.Schema({

        IpAddr: { type: String},
        departureCity: { type: String},
        arrivalCity: { type: String},
        createdAt: { type: Date, default: Date.now }
    
});
// Export the model so it can be used in other parts of the application.
module.exports = mongoose.model('Flight',FlightSchema);