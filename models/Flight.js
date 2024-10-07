// models/flightModel.js
const mongoose = require('mongoose');

const FlightSchema = new mongoose.Schema({

        departureCity: { type: String},
        arrivalCity: {String},
        flightDate: {Date},
        stops: {Number}
    
});
// Export the model so it can be used in other parts of the application.
module.exports = mongoose.model('Flight', FlightSchema);