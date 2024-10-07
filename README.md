Query Parameters: The route accepts two possible query parameters: departure and arrival. You only need to provide one of them.

Example: /api/flights?departure=Londonor /api/flights?arrival=Paris.

Filter Flights:

If a departure city is provided, it filters the flightRoute array for all routes where the departure matches.

If an arrival city is provided, it filters for routes where the arrival matches.
Return Data:
If the departure city is sent, it returns all possible arrival cities from that departure.
If the arrival city is sent, it returns all possible departure cities.
Error Handling: It handles cases where neither a departure nor an arrival is sent and returns a 400 error. It also handles cases where no flights are found by returning a 404 error.
Example API Usage
Request 1: /api/flights?departure=London
