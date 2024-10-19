// Initialize the map and set its view to a default location (e.g., Europe)
var map = L.map('map').setView([51.505, -0.09], 3);

// Set up OpenStreetMap tiles with English labels
L.tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 18
}).addTo(map);

// Define custom icons for different life cycle phases
var explorationIcon = L.icon({
    iconUrl: 'https://maps.gstatic.com/mapfiles/ms2/micons/blue-dot.png',
    iconSize: [32, 32]
});

var involvementIcon = L.icon({
    iconUrl: 'https://maps.gstatic.com/mapfiles/ms2/micons/yellow-dot.png',
    iconSize: [32, 32]
});

var developmentIcon = L.icon({
    iconUrl: 'https://maps.gstatic.com/mapfiles/ms2/micons/green-dot.png',
    iconSize: [32, 32]
});

var consolidationIcon = L.icon({
    iconUrl: 'https://maps.gstatic.com/mapfiles/ms2/micons/red-dot.png',
    iconSize: [32, 32]
});

var stagnationIcon = L.icon({
    iconUrl: 'https://maps.gstatic.com/mapfiles/ms2/micons/purple-dot.png',
    iconSize: [32, 32]
});

var rejuvenationIcon = L.icon({
    iconUrl: 'https://maps.gstatic.com/mapfiles/ms2/micons/orange-dot.png',
    iconSize: [32, 32]
});

var declineIcon = L.icon({
    iconUrl: 'https://maps.gstatic.com/mapfiles/ms2/micons/ltblue-dot.png',
    iconSize: [32, 32]
});

// Create an array to store all the markers
var allMarkers = [];

// Create a Set to track which destinations (by name) have already been added
var addedDestinations = new Set();

// Fetch the CSV data and add markers dynamically
fetch('destinations.csv')
  .then(response => response.text())  // Fetch the CSV file as text
  .then(csvText => {
    Papa.parse(csvText, {
      header: true,  // Treat the first row of the CSV as the header row
      complete: function(results) {
        let data = results.data;

        data.forEach(dest => {
          // Create a unique identifier for each destination by name only
          let uniqueKey = dest.name.toLowerCase();

          // Skip if we've already added this destination by name
          if (addedDestinations.has(uniqueKey)) {
            console.log(`Skipping duplicate: ${dest.name}`);
            return;  // Skip this iteration
          }

          // Mark this destination as added by name
          addedDestinations.add(uniqueKey);

          // Determine the correct icon based on the phase in the CSV
          let icon;
          if (dest.phase === "Exploration") icon = explorationIcon;
          else if (dest.phase === "Involvement") icon = involvementIcon;
          else if (dest.phase === "Development") icon = developmentIcon;
          else if (dest.phase === "Consolidation") icon = consolidationIcon;
          else if (dest.phase === "Stagnation") icon = stagnationIcon;
          else if (dest.phase === "Rejuvenation") icon = rejuvenationIcon;
          else if (dest.phase === "Decline") icon = declineIcon;
          else return;  // Skip if no valid phase

          // Add the marker to the map using latitude and longitude from the CSV
          var marker = L.marker([dest.latitude, dest.longitude], { icon: icon }).addTo(map);
          marker.bindPopup(`${dest.name} - ${dest.phase} Phase, ${dest.country}`);

          // Store the marker and its data in the allMarkers array for searching
          allMarkers.push({
            marker: marker,
            name: dest.name.toLowerCase(),
            phase: dest.phase.toLowerCase(),
            country: dest.country.toLowerCase()
          });
        });
      }
    });
  });

// Function to search and filter markers based on the search bar input
function searchDestinations() {
  var input = document.getElementById('searchInput').value.toLowerCase();
  var selectedPhase = document.getElementById('phaseFilter').value.toLowerCase();  // Convert to lowercase for consistency

  // Loop through all markers and show/hide based on search input and phase filter
  allMarkers.forEach(dest => {
    var matchesSearch = dest.name.includes(input) || dest.country.includes(input);
    var matchesPhase = (selectedPhase === "all" || dest.phase === selectedPhase);

    if (matchesSearch && matchesPhase) {
      dest.marker.addTo(map);  // Show marker if it matches both search and phase
    } else {
      map.removeLayer(dest.marker);  // Hide marker if it doesn't match
    }
  });
}

// Function to filter markers by phase using the dropdown
function filterByPhase() {
  var selectedPhase = document.getElementById('phaseFilter').value.toLowerCase();  // Convert to lowercase for consistency

  // Loop through all markers and filter based on the selected phase
  allMarkers.forEach(dest => {
    var destPhase = dest.phase.toLowerCase();  // Make sure the phase comparison is case-insensitive

    if (selectedPhase === "all" || destPhase === selectedPhase) {
      dest.marker.addTo(map);  // Show marker if phase matches or "all" is selected
    } else {
      map.removeLayer(dest.marker);  // Hide marker if phase doesn't match
    }
  });
}
