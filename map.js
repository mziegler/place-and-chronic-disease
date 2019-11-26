// Path to the CSV file with coded place data
const PLACE_DATA_FILE_PATH = 'data/places-coded-1.json'


let map = L.map('map').setView([ 47.65822,-122.313383], 17)

// Background layer
let basemap = L.tileLayer('https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}{r}.png', {
    attribution: '<a href="https://wikimediafoundation.org/wiki/Maps_Terms_of_Use">Wikimedia</a>',
    minZoom: 1,
    maxZoom: 19
}).addTo(map)


// Function to add place markers to the map
let placeMarkers = L.layerGroup().addTo(map)
function addPins() {
    placeMarkers.clearLayers();

    for (const place of codedPlaces) {
        L.marker(place.coords)
            .addTo(map)
            .bindTooltip(place.name)
            .bindPopup(
              `
              <h3>${place.name}</h3>
              <ul>
                ${
                  Object.keys(place.tags).map((tag,i) => `
                    <li>${tag}</li>
                  `).join('')
                }
              </ul>
              `,
              {className: 'place-popup'}
            )

    }
}


// Load coded place data, and put markers on the map
let codedPlaces = null
$.getJSON(PLACE_DATA_FILE_PATH, function(json) {
    codedPlaces = json;
    addPins()
})
