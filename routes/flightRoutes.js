const express = require('express');
const cron = require('node-cron');
const axios = require('axios');
const fs = require('fs');
const pdf = require('pdf-parse');
const Flight = require('../models/Flight.js');
const router = express.Router();

//const myserver = require('../server.js');


const filePath = './tmp/aycf-availability.pdf';

cron.schedule('0 0 * * *', async () => {
  try {
  const url = 'http://multipass.wizzair.com/aycf-availability.pdf';
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  //response.setHeader("Content-Type", "text/pdf");
  fs.writeFileSync(filePath, response.data);
  console.log('PDF downloaded and saved');
  if (response.status === 200) {
      console.error('Failed to download PDF');
      return;
  }
  }
  catch (error) {
      console.error('Error fetching PDF:', error.message);
  }
});

////////////////////////////////////////////////////////////////
async function extractFlights() {
  try {
      //await fetchPDF();
      const parsedFlights = [];
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdf(dataBuffer);
      const text = data.text;
      return text;
  } catch (error) {
      console.error('Error parsing PDF:', error.message);
      return [];
  }
  
}
// compare cities names from the text data to citie.json file names
// Load data from a JSON file
function loadCitiesData() {
  try {
      // Read the JSON file (use synchronous reading)
      const data = fs.readFileSync('./cities.json', 'utf8');
      
      // Parse the JSON file content to an array
      const cityArray = JSON.parse(data);
      
      console.log('Loaded flight data:', cityArray);
      return cityArray;
  } catch (err) {
      console.error('Error loading flight data:', err);
      return [];
  }
}
async function splitLines() {
  try {
    const cityList = loadCitiesData();
      // const cityList = [
      //     "Alesund", "Aberdeen", "Abu Dhabi","Agadir", "Alexandria", "Alghero", "Alicante", "Almaty", "Amman", 
      //     "Ancona","Ankara", "Antalya", "Aqaba", "Athens","Bacau", "Baku", "Banja Luka", "Barcelona", "Bari", "Basel/Mulhouse", 
      //     "Belgrade", "Bergamo", "Bergen", "Berlin", "Bilbao", "Billund", "Birmingham", "Bishkek", "Bologna", "Brasov", "Bratislava", 
      //     "Bremen", "Brindisi", "Brussels", "Brussels Charleroi", "Bucharest", "Budapest", "Burgas", "Bydgoszcz", "Cairo", "Castellon", "Catania", "Chania (Crete)", "Chisinau", 
      //     "Cluj", "Cluj-Napoca", "Cologne", "Comiso", "Constanta", "Copenhagen", "Corfu", "Craiova", "Dalaman", "Dammam", "Debrecen", 
      //     "Dortmund", "Dubai", "Dubrovnik", "Eindhoven", "Erbil", "Faro", "Frankfurt", "Friedrichshafen", "Fuerteventura", "Funchal", "Gdansk", "Geneva", "Genoa", 
      //     "Girona", "Giza", "Glasgow", "Gothenburg", "Gran Canaria", "Grenoble", "Hamburg", "Haugesund", "Heraklion", "Hurghada", "Iasi", "Ibiza", "Istanbul", "Izmir", 
      //     "Jeddah", "Karlsruhe/Baden-Baden", "Katowice", "Kaunas", "Kefalonia", "Kos", "Kosice", "Krakow", "Kutaisi", "Kuwait City", "Lampedusa", "Larnaca", 
      //     "Leeds/Bradford", "Leipzig/Halle", "Lisbon", "Liverpool", "Ljubljana", "London", "Lublin", 
      //     "Lyon", "Madrid", "Malaga", "Male", "Malmo", "Malta", "Madeira", "Madinah", "Marrakech", 
      //     "Memmingen", "Milan","Muscat", "Mykonos", "Naples", "Nice", "Nis", "Nuremberg", "Ohrid", "Olbia", "Nur-Sultan", "Oslo", 
      //     "Palma De Mallorca", "Paris", "Perugia", "Pescara", "Pisa", "Plovdiv", "Podgorica", "Poprad", "Porto", "Poznan", "Prague", 
      //     "Pristina", "Radom", "Reykjavik", "Rhodes", "Riga", "Rimini", "Riyadh", "Rome", "Rzeszow", "Salzburg", "Samarkand", "Santander", "Sandefjord", "Santorini", "Sarajevo", 
      //     "Satu Mare", "Sevilla", "Sharm el-Sheikh", "Sibiu", "Skiathos", "Skopje", "Sofia","Sohag", "Split", "Stavanger", "Stockholm", 
      //     "Stuttgart", "Suceava", "Szczecin", "Tallinn", "Tashkent", "Tel Aviv", "Targu-Mures", "Tenerife", "Thessaloniki", "Timisoara", 
      //     "Tirana", "Trieste", "Tromso", "Trondheim", "Turin", "Turkistan", "Turku", "Tuzla", "Valencia","Varna", "Venice", "Verona", 
      //     "Vienna", "Vilnius", "Warsaw", "Wroclaw", "Yerevan", "Zakinthos Island","Zakynthos", "Zaragoza"
      //   ];
      const data = await extractFlights();
      const lines = data.split('\n');
                  //console.log(lines);
                  // Filter lines that start with a city in the list
                  const filteredLines = lines.filter(line => {
                  return cityList.some(city => line.startsWith(city));
                  })
                  const sortedLines = filteredLines.sort(); // Sort the lines alphabetically
                  // Iterate through lines and extract first and second city names
      let flightRoute = [];
      const processedLines = sortedLines.map(line => {
          // Trim the line to remove extra spaces
          let trimmedLine = line.trim();
      
          let foundCities = [];
          let route = new Map();

          // Iterate over cities and check if any city appears in the line
          for (const city of cityList) {
          const departure = new RegExp(('\\b'+city));  // Match whole city name, case-insensitive
          //const arrival= new RegExp(`\\${city}\\b`, 'i');  // Match whole city name, case-insensitive
          const arrival= new RegExp(city+'$');
          if(departure.exec(trimmedLine)!=null){
              route.set('Departure',departure.exec(trimmedLine)[0]);
          }
          
          if((arrival.exec(trimmedLine))!=null){
              route.set('Arrival', arrival.exec(trimmedLine)[0]);
          }
          if (route.size === 2){
              flightRoute.push(route);
              break;
          }
          
         
          // Check if the line contains the city name
          if (departure.test(trimmedLine)) {
              foundCities.push(city);// Store the found departure city
              //console.log('Depart '+foundCities);
          }
          if (arrival.test(trimmedLine)) {
              foundCities.push(city); // Store the found arrival city
              //console.log('Arrival '+ foundCities);
          }
          // If we already found two cities, we can stop looking
          if (foundCities.length === 2) {
              //console.log(foundCities);
              break;  
          }
          }
          // If we found at least two cities, format them as departure and arrival
          if (foundCities.length >= 2) {
          
          //return `${foundCities[0]} || arrival: ${foundCities[1]}`;
          return `Departure: ${route.get('Departure')},arrival: ${route.get('Arrival')}`;
          } 
          // If less than two cities found, return the original line or error message
          else if (foundCities.length === 1) {
          return `departue: ${foundCities[0]} - Could not determine arrival city.`;
          } else {
          return `No city found in the line: ${line}`;
          }
          
      });
     
      // Convert the array of Maps to an array of plain objects
      let flightRouteAsObjects = flightRoute.map(route => {
          return Object.fromEntries(route);
      });
      // Convert the array of objects to JSON format
      let flightRoutesAsJSON = JSON.stringify(flightRouteAsObjects, null, 2);
      // Print the JSON string
      //console.log("Flight routes in JSON format:");
      //console.log(flightRoutesAsJSON);
      //console.log(flightRoute);
      //console.log('Precessed length :'+processedLines.length);
      //console.log('FlightRoute length :'+flightRoute.length);
      return flightRoute;
      
  } catch (error) {
      console.error('Error extracting flights:', error.message);
  }
}

///////////////////////////////////////////////////////
//const app = express();


// Define the API route
router.get('/search', async(req, res) => {
  const departure = req.query.departure;
  const arrival = req.query.arrival;
  try {
    const flights = await splitLines();
    
    // If neither departure nor arrival is provided, return an error
    if (!departure && !arrival) {
      return res.status(400).json({ error: 'Please provide either a departure or arrival city.' });
  }

    // Filter the flight routes based on the provided city
    let filteredFlights = [];

    if (departure) {
      // Filter flights based on departure city
      filteredFlights = await flights.filter(route => route.get('Departure') === departure);
      
      if (filteredFlights.length === 0) {
          return res.status(404).json({ message: `No flights found from ${departure}.` });
      }

      // Return the matching arrivals
      const availableArrivals = filteredFlights.map(route => route.get('Arrival'));
      return res.json({
          departureCity: departure,
          availableArrivals
      });
  }
  if (arrival) {
    // Filter flights based on arrival city
    filteredFlights = await flights.filter(route => route.get('Arrival') === arrival);
    
    if (filteredFlights.length === 0) {
        return res.status(404).json({ message: `No flights found to ${arrival}.` });
    }

    // Return the matching departures
    const availableDepartures = filteredFlights.map(route => route.get('Departure'));
    return res.json({
        arrivalCity: arrival,
        availableDepartures
    });
}

    // // Map the filtered results to plain objects for easier JSON formatting
    // const formatedFlights = filteredFlights.map(route => {
    //   return Object.fromEntries(route);  // Convert Map to plain object
    // });

    // // If no results found, return a message
    // if (formatedFlights.length === 0) {
    //   return res.status(404).json({ message: 'No routes found for the given city.' });
    // }

    // // Return the filtered flight routes as JSON
    // return res.json(formatedFlights);
  }

  catch (error) {
    console.error('Error searching for flights:', error.message);
    return res.status(500).json({ error: 'An error occurred while searching for flights.' });
  }

})

// Get all flights


// router.get('flights', async (req, res) => {
//   const { departure, arrival } = req.query;
  
//   const directFlights = await Flight.find({ departureCity: departure, arrivalCity: arrival });
//   if (directFlights.length) {
//     res.json(directFlights);
//   } else {
//     // If no direct flights, search for connecting flights
//     const possibleConnections = await Flight.find({ departureCity: departure });
//     let connectingFlights = [];
    
//     for (let flight of possibleConnections) {
//       const secondLeg = await Flight.find({ departureCity: flight.arrivalCity, arrivalCity: arrival });
//       if (secondLeg.length) {
//         connectingFlights.push({
//           firstLeg: flight,
//           secondLeg: secondLeg[0]
//         });
//       }
//     }
    
//     res.json(connectingFlights);
//   }
// });

module.exports = router;
